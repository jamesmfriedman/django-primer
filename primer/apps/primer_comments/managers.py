from django.conf import settings
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.utils.encoding import force_text

class CommentManager(models.Manager):

    def in_moderation(self):
        """
        QuerySet for all comments currently in the moderation queue.
        """
        return self.get_query_set().filter(is_public=False, is_removed=False)

    def for_model(self, model):
        """
        QuerySet for all comments for a particular model (either an instance or
        a class).
        """
        ct = ContentType.objects.get_for_model(model)
        qs = self.get_query_set().filter(content_type=ct)
        if isinstance(model, models.Model):
            qs = qs.filter(object_pk=force_text(model._get_pk_val()))
        return qs

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