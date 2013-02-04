from django import template
from django.template.loader import render_to_string

from primer.utils import get_request
from primer.comments.forms import CommentForm, StatusForm, TimelineForm, get_comment_form
from primer.comments.utils import get_content_types_hash, get_content_types_list

register = template.Library()

@register.simple_tag(takes_context=True)
def comments(context, target, **kwargs):
    """
    This renders a comments list

    Arguments
        see setup_comment_data
    """
    
    comment_data = setup_comment_data('comments', target, **kwargs)
    return render_to_string('comments/base_comments.html', comment_data, context)


@register.simple_tag(takes_context=True)
def wall(context, target, **kwargs):
    comment_data = setup_comment_data('wall', target, **kwargs)
    return render_to_string('comments/base_comments.html', comment_data, context)


@register.simple_tag(takes_context=True)
def timeline(context, target, position='center', **kwargs):
    kwargs['css_class_name'] = 'comments-timeline-%s' % position
    comment_data = setup_comment_data('timeline', target, **kwargs)
    return render_to_string('comments/base_comments.html', comment_data, context)


def setup_comment_data(comments_type, target, placeholder = None, stream = [], limit = 10, reversed = 0, read_only = 0, forms = None, tab_class = 'nav-pills', login_required = True, css_class_name=''):
    """
    Sets up comment data for walls, comment lists, timelines, etc
    Arguments
        comments_type: comments, wall, or timeline
        target: a single db object that the comments belong to
        placeholder : the placeholder text for the comment input box
        limit: the number of comments per page
        reversed: 0 or 1 as boolean. Reverses the direction of the list and renders the form at the top or bottom
        read_only: 0 or 1 as boolean. Whether or not the wall is read only
    """
    
    if comments_type == 'comments':
        css_class_name = 'comments-list %s' % css_class_name
    else: 
        css_class_name = ' comments-%s %s' % (comments_type, css_class_name)
    
    
    if not forms:
        if comments_type == 'wall':
            comment_forms = [StatusForm(target, comments_type = comments_type)]
        elif comments_type == 'timeline':
            comment_forms = [TimelineForm(target, comments_type = comments_type)]
        else:
            comment_forms = [CommentForm(target, comments_type = comments_type)]
    else:
        comment_forms = [get_comment_form(form)(target, comments_type = comments_type) for form in forms.replace(' ', '').split(',')]
        

    # setup reversed properly, we only allow reversed for comments
    if comments_type != 'comments':
        reversed = False

    # optionally overwrite the placeholder text that gets passed in
    if placeholder:
        comment_form.fields['comment'].widget.attrs['placeholder'] = placeholder

    # add this set of data to the session and get
    # the comment hash
    stream = list(stream)
    stream.extend([target])
    comment_hash = add_to_session(stream, read_only)

    return {
        'target' : target,
        'comment_forms' : comment_forms,
        'comment_hash' : comment_hash,
        'limit' : limit,
        'comments_type' : comments_type,
        'read_only' : read_only,
        'css_class_name' : css_class_name,
        'tab_class' : tab_class,
        'login_required' : login_required,
        'is_reversed' : reversed
    }


def add_to_session(target, read_only):
    """
    This adds a hash that identifies the contents of a wall of comments_list in the session
    This hash will get checked against when loading more comments, to make sure
    They are allowed to load the content they are asking for

    The hashing algorithm is sha224

    Arguments
        target: the target(s) that are getting hashed
    """

    # for security, store a hash of this comments conetents in the users session
    request = get_request()

    # create our list if nonexistant
    if not 'primer_comment_hashes' in request.session:
        request.session['primer_comment_hashes'] = {}

    # convert the stream to a serialized list of content_types and pks
    target_list = get_content_types_list(target)
    comment_hash = get_content_types_hash(target_list)

    # add it to the session
    request.session['primer_comment_hashes'][comment_hash] = {
        'content_types' : target_list,
        'read_only' : bool(read_only),
        'blah' : 'foo'
    }

    request.session.save()
    print read_only

    return comment_hash



