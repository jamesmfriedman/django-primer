from django.db import models
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
        
        content_type, object_id  = ContentType.objects.get_for_model(obj), obj.pk
        entry, created = self.get_or_create(content_type = content_type, object_id = object_id, user = user)

        return entry, created


    def remove_for_object(self, obj, user):
        """
        Likes an object
        """
        content_type, object_id  = ContentType.objects.get_for_model(obj), obj.pk
        self.filter(content_type = content_type, object_id = object_id, user = user).delete()


    def get_for_object(self, obj):
        """
        Returns all the likes for a particular user
        """
        content_type, object_id  = ContentType.objects.get_for_model(obj), obj.pk
        return self.get_query_set().filter(object_id = object_id, content_type = content_type).get_sum()


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
    value = models.IntegerField(default = 1)

    content_type   = models.ForeignKey(ContentType)
    object_id      = models.TextField()
    content_object = generic.GenericForeignKey()

    objects = LikesManager()
