from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse
from django.db.models import Q
from django.contrib.comments import signals
from django.contrib.comments.models import Comment
from django.contrib.comments.views.comments import CommentPostBadRequest
from django.utils.html import escape

from primer.utils import paginate
from primer.likes.models import Like

from forms import get_comment_form

MAX_COMMENTS_PER_PAGE = 50


def delete(request):
    """
    Delete a comment. We dont actually delete it, we just set is removed
    This view will only let the comment author delete it
    """
    if request.method == 'POST':
        try:
            comment = Comment.objects.get(pk = request.POST.get('comment_id'), user = request.user)
            comment.is_removed = True
            comment.save()
        except Comment.DoesNotExist:
            pass

    return {}


def like(request):
    """
    Likes a comment
    """
    pk = request.POST.get('comment')
    unlike = int(request.POST.get('unlike', 0))
    details = int(request.POST.get('details', 0))

    if details:
        view_template = 'comments/likes_details.html'
    else:
        view_template = 'comments/likes_short.html'

    if pk:
        try:
            comment = Comment.objects.get(pk = pk)
        except Comment.DoesNotExist:
            comment = None
            pass

        if comment:

            if unlike:
                Like.objects.remove_for_object(comment, request.user)
            else:
                Like.objects.create_for_object(comment, request.user)

            return {
                'comment' : comment,
                'view_template': view_template
            }

    return HttpResponse('')


def post(request, next = None, using = None):

    if request.method == 'POST':
        
        # Fill out some initial data fields from an authenticated user, if present
        data = request.POST.copy()
        comments_type = data.get('comments_type', 'comments')
        
        if request.user.is_authenticated():
            if not data.get('name', ''):
                data['name'] = request.user.get_full_name() or request.user.username
            if not data.get('email', ''):
                data['email'] = request.user.email

        # Look up the object we're trying to comment about
        ctype = data.get('content_type')
        object_pk = data.get('object_pk')
        if ctype is None or object_pk is None:
            return CommentPostBadRequest("Missing content_type or object_pk field.")
        try:
            model = models.get_model(*ctype.split(".", 1))
            target = model._default_manager.using(using).get(pk=object_pk)
        except TypeError:
            return CommentPostBadRequest(
                "Invalid content_type value: %r" % escape(ctype))
        except AttributeError:
            return CommentPostBadRequest(
                "The given content-type %r does not resolve to a valid model." % \
                    escape(ctype))
        except ObjectDoesNotExist:
            return CommentPostBadRequest(
                "No object matching content-type %r and object PK %r exists." % \
                    (escape(ctype), escape(object_pk)))
        except (ValueError, ValidationError), e:
            return CommentPostBadRequest(
                "Attempting go get content-type %r and object PK %r exists raised %s" % \
                    (escape(ctype), escape(object_pk), e.__class__.__name__))

        # Construct the comment form
        CommentForm = get_comment_form(data['formclass'])
        form = CommentForm(target, comments_type = comments_type, data=data)

        # Check security information
        if form.security_errors():
            return CommentPostBadRequest(
                "The comment form failed security verification: %s" % \
                    escape(str(form.security_errors())))

        # If there are errors or if we requested a preview show the comment
        if form.errors:
            # handle errors or preview
            pass

        # Otherwise create the comment
        comment = form.get_comment_object()
        comment.ip_address = request.META.get("REMOTE_ADDR", None)
        if request.user.is_authenticated():
            comment.user = request.user

        # Signal that the comment is about to be saved
        responses = signals.comment_will_be_posted.send(
            sender  = comment.__class__,
            comment = comment,
            request = request
        )

        for (receiver, response) in responses:
            if response == False:
                return CommentPostBadRequest(
                    "comment_will_be_posted receiver %r killed the comment" % receiver.__name__)

        # Save the comment and signal that it was saved
        comment.save()
        signals.comment_was_posted.send(
            sender  = comment.__class__,
            comment = comment,
            request = request
        )

        comments = Comment.objects.filter(pk = comment.pk)
        comments = comments.select_related('user')
        comments = comments.prefetch_related('children__user', 'likes')
        comment = comments[0]
        comment.set_comment_template_dir(comments_type)

    return {
        'comment' : comment,
        'view_template' : comment.template()
    }



def load(request):
    """
    Post Params
        content: the hash that is set in primer_comment_hashes which points to the content to lookup
        display: basically the template to render, either comments or wall for now 
    """

    comments = None
    remaining_comments_count = 0
    view_template = 'comments/list.html'

    # get all of our get/post params
    content_types_hash = request.REQUEST.get('content')
    limit = int(request.REQUEST.get('limit', MAX_COMMENTS_PER_PAGE))
    comments_type = request.REQUEST.get('type', 'comments')
    is_reversed = int(request.REQUEST.get('isReversed', 0))
    object_pk = request.REQUEST.get('pk')
    current_page = int(request.REQUEST.get('page', 1))

    load_more = False

    # make sure our limit is within range
    if limit > MAX_COMMENTS_PER_PAGE:
        limit = MAX_COMMENTS_PER_PAGE

    # get our content types to lookup out of our session
    comments_setup = request.session['primer_comment_hashes'][content_types_hash]
    content_types = comments_setup['content_types']

    # we have an explicit object_pk, get the replies for this comment
    if object_pk:
        comments = Comment.objects.filter(parent_id = object_pk)
        limit = 15
        view_template = 'comments/list_replies.html'
    
    # we have contenttypes to lookup
    elif content_types:
        
        # start our comment expression
        expression = None

        # loop through the objects in our list, and build an expression for our query
        for obj in content_types:

            ctype = ContentType.objects.get_by_natural_key(
                obj['app_label'], obj['content_type'])

            # the expression for this loop iteration
            exp = Q(content_type=ctype, object_pk=obj['object_pk'], site__pk=settings.SITE_ID)

            # if no expression has been set
            if not expression:
                expression = exp
            else:
                # or it against our current expression
                expression = (expression | exp)

        # filter our comments with our expression
        comments = Comment.objects.filter(expression)
        
    if comments:
        comments = comments.select_related('user')
        comments = comments.prefetch_related('likes', 'children__user', 'children__likes')
        comments = comments.order_by('-created')
        
        # filter public and removed
        comments = comments.filter(is_public=True)

        if getattr(settings, 'COMMENTS_HIDE_REMOVED', True):
            comments = comments.filter(is_removed = False)

        # paginate our comments
        page = paginate(comments, limit)
        comments = list(page.object_list)


        if is_reversed or object_pk:
            comments.reverse()

        for comment in comments: 
            comment.set_comment_template_dir(comments_type)

        if object_pk and current_page == 1:
            comments = comments[:-3]

        # check to see if we need a load more link
        if page.has_next():
            load_more = True
        elif current_page > page.paginator.num_pages:
            comments = []


        remaining_comments_count = page.paginator.count - page.end_index()


    return {
        'view_template' : view_template,
        'comments' : comments,
        'remaining_comments_count' : remaining_comments_count,
        'load_more' : load_more,
        'comments_type' : comments_type,
        'is_reversed' : is_reversed,
        'read_only' : comments_setup.get('read_only', False)
    }