from django.db import models
from django.contrib.comments.models import Comment
from django.contrib.auth.models import User
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType

from primer.db.models import PrimerModel
from primer.utils import get_current_user


class LikesManager(models.Manager): 

    def get_query_set(self):
        qs = super(LikesManager, self).get_query_set()
        qs = qs.select_related('user')

        user = get_current_user()
        if user:
            qs = qs.extra(select={'order':'(case when user_id=%s then 0 else user_id end)' % user.id }, order_by = ['order'])

        qs = qs.order_by('-created')
        return qs

    def create_for_object(self, obj, user):
        """
        Likes an object
        """
        
        content_type, object_pk  = ContentType.objects.get_for_model(obj), obj.pk
        if obj.__class__.__name__.lower() == 'comment':
            entry, created = self.get_or_create(content_type = content_type, object_pk = object_pk, comment = obj, user = user)
        else:
            entry, created = self.get_or_create(content_type = content_type, object_pk = object_pk, user = user)

        return entry, created


    def remove_for_object(self, obj, user):
        """
        Likes an object
        """
        content_type, object_pk  = ContentType.objects.get_for_model(obj), obj.pk
        self.filter(content_type = content_type, object_pk = object_pk, user = user).delete()


    def get_for_object(self, obj):
        """
        Returns all the likes for a particular user
        """
        content_type, object_pk  = ContentType.objects.get_for_model(obj), obj.pk
        return self.get_query_set().filter(object_pk = object_pk, content_type = content_type).get_sum()


    def get_sum(self):
        return self.get_query_set().aggregate(models.Sum('value'))['value__sum'] or 0

    def current_user_has_liked(self):
        return_val = False
        user = get_current_user()
        if user:
            return_val = user.id in [ like.user_id for like in list(self.get_query_set())]

        return return_val



class Like(PrimerModel):
    
    user = models.ForeignKey(User)
    comment = models.ForeignKey(Comment, null = True, blank = True, related_name = 'likes')
    value = models.IntegerField(default = 1)

    content_type   = models.ForeignKey(ContentType)
    object_pk      = models.TextField()
    content_object = generic.GenericForeignKey(ct_field='content_type', fk_field='object_pk')

    objects = LikesManager()
