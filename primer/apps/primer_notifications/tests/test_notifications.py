from django.test import TestCase
from django.contrib.auth.models import User
from django.test.client import Client

from ..models import StoredNotification
from ..context_processors import notifications
from .. import Notification, InfoNotification, SuccessNotification, WarningNotification, ErrorNotification


class NotificationsTestCase(TestCase):
   
    def setUp(self):
        super(NotificationsTestCase, self).setUp()
        self.user1 = User.objects.create_user('user1', 'user1@test.com', '12345');
            
