from django.db import models
from django.contrib.auth.models import User
from django.template.loader import select_template

from jsonfield import JSONField
from primer.db.models import PrimerModel


class NotificationStore(PrimerModel):
    """
    A base class for notifications
    """
    message = models.TextField(help_text = 'The actual notification the user will read')
    
    followers = models.ManyToManyField(User, through = 'UserNotification',
        help_text = 'The users this notification is attached to')
    
    sender = models.ForeignKey(User, blank = True, null = True, related_name = 'sender',
        help_text = 'This is the person that sent the notification, can be null')

    target = models.CharField(max_length = 255, null = True, blank = True,
        help_text = 'This is where the notification links to') 

    data = JSONField(null = True, blank = True,
        help_text = 'Random pickled data to attach to any notification')

    type = models.CharField(max_length = 255, null = True, blank = True)


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
        return self.message



class UserNotification(PrimerModel):
    """
    A through table for a many to many from users to notifications
    """
    user = models.ForeignKey(User,
        help_text = 'User link to the notification')
    
    notification = models.ForeignKey(NotificationStore,
        help_text = 'Link to the notification')
    
    read = models.BooleanField(default = False, db_index = True,
        help_text = 'Whether or not the notification has been read by the user')

    @classmethod
    def get_for_user(cls, user):
        """
        Gets notifications for a specific user

        Returns
            A queryset of of user notification links
            with the the notifications prefetched
        """
        notifications = cls.objects.filter(user = user)
        notifications = notifications.order_by('-created')
        notifications = notifications.prefetch_related('notification')

        return notifications

    @classmethod
    def mark_all_as_read_for_user(cls, user):
        cls.objects.filter(user = user).update(read = True)


