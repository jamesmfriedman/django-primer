from django.db import models
from django.contrib.auth.models import User
from django.template.loader import select_template
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.db.models.signals import post_save

from jsonfield import JSONField

from primer.db.models import PrimerModel
from primer.contrib.auth.utils import process_user_links
from primer.contrib.push.services import PushService


class StoredNotificationManager(models.Manager):
    """
    Notification Manager
    """
    def get_for_user(self, user):
        """
        Gets notifications for a specific user

        Returns
            A queryset of of user notification links
            with the the notifications prefetched
        """
        notifications = self.filter(user = user)
        notifications = notifications.order_by('-created')

        return notifications

    def mark_all_as_read_for_user(self, user):
        updated = self.filter(user = user).update(read = True)
        if updated:
            push_count_update(user)


class StoredNotification(PrimerModel):
    """
    A base class for notifications
    """
    user = models.ForeignKey(User,
        help_text = 'User link to the notification')

    message = models.TextField(help_text = 'The actual notification the user will read')

    read = models.BooleanField(default = False, db_index = True,
        help_text = 'Whether or not the notification has been read by the user')
    
    sender = models.ForeignKey(User, blank = True, null = True, related_name = 'sender',
        help_text = 'This is the person that sent the notification, can be null')

    target = models.CharField(max_length = 255, null = True, blank = True,
        help_text = 'This is where the notification links to') 

    data = JSONField(null = True, blank = True,
        help_text = 'Random pickled data to attach to any notification')

    type = models.SlugField(max_length = 64, blank = True, default = 'notification')

    # generic relationship
    content_type = models.ForeignKey(ContentType, blank = True, null = True)
    object_id = object_id = models.TextField(blank = True, null = True)
    content_object = generic.GenericForeignKey('content_type', 'object_id')

    objects = StoredNotificationManager()

    def template(self):
        """
        Gets the template for the notification
        """
        type_name = self.type.replace('-','_')
        
        template = select_template([
            'notifications/view/%s.html' % type_name,
            'notifications/view/default.html'
            ])

        return template.name


    def __unicode__(self):
        return process_user_links(self.message)


##############################################################################
# Utils
##############################################################################
def push_count_update(user):
    """
    Pushes a count update to all of the clients machines
    """
    if PushService:
        count = StoredNotification.objects.filter(user = user, read = False).count()
        PushService.send('notification.count', users = user, data = {'count' : count})

    
##############################################################################
# Signals
##############################################################################
def push_count_update_handler(sender, instance, created, **kwargs):
    """
    Pushes a count update to all of the clients machines
    """
    if created:
        push_count_update(instance.user)

post_save.connect(push_count_update_handler, sender = StoredNotification)