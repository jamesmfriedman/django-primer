from django.db import models
from django.contrib.comments.models import Comment
from django.template.loader import select_template
from django.conf import settings
from django.contrib.comments.managers import CommentManager
from django.contrib.contenttypes import generic
from jsonfield import JSONField

from primer.db.models import UUIDField
from forms import PrimerCommentForm


def get_css_class(self):
    return 'comment-' + self.type.replace('_', '-')

def set_comment_template_dir(self, template_dir):
    self._comments_template_dir = template_dir

def get_comment_template(self):
    
    return select_template([
        'comments/%s/%s.html' % (self._comments_template_dir, self.type),
        'comments/%s/default.html' % self._comments_template_dir,
        'comments/comments/default.html'
        ]).name

def get_reply_form(self):
    return PrimerCommentForm(self, comments_type = 'comments')


class PrimerCommentManager(CommentManager):
    """
    A custom default manager that adds a visible method to
    just show comments that are visible
    """
    use_for_related_fields = True

    def visible(self, *args, **kwargs):
        
        qs = self.get_query_set().filter(is_public = True)

        if getattr(settings, 'COMMENTS_HIDE_REMOVED', True):
            qs = qs.filter(is_removed = False)

        return qs


    def visible_count(self, *args, **kwargs):
        """
        A custom count function to be called by a related manager in a template
        Since we have a prefetch related cache, it doesnt cost us another db hit
        to count these vs doing a count db call
        """
        comments = []
        for comment in self.get_query_set():
            if getattr(settings, 'COMMENTS_HIDE_REMOVED', True):
                if not comment.is_removed and comment.is_public:
                    comments.append(comment)
            elif comment.is_public:
                comments.append(comment)

        return len(comments)

    

# add additional fields onto the comment model
Comment.add_to_class('uuid', UUIDField())
Comment.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Comment.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))
Comment.add_to_class('likes', generic.GenericRelation('likes.Like'))
Comment.add_to_class('type', models.CharField(max_length = 255, blank = True, null = True))
Comment.add_to_class('data', JSONField(blank = True, null = True))


# additional methods
Comment.add_to_class('template', get_comment_template)
Comment.add_to_class('get_css_class', get_css_class)
Comment.add_to_class('set_comment_template_dir', set_comment_template_dir)
Comment.add_to_class('get_reply_form', get_reply_form)
Comment.add_to_class('_default_manager', PrimerCommentManager())



