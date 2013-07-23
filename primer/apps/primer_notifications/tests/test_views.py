from django.test import TestCase
from django.contrib.auth.models import User
from django.test import Client
from django.core.urlresolvers import reverse

from ..models import StoredNotification


class NotificationViewTestCase(TestCase):
   
    def setUp(self):
        super(NotificationViewTestCase, self).setUp()
        self.user1 = User.objects.create_user('user1', 'user1@test.com', '12345');
        
        self.notification = StoredNotification.objects.create(
            message = 'New Notification',
            user = self.user1
        )

        self.notification2 = StoredNotification.objects.create(
            message = 'New Notification 2',
            user = self.user1
        )

        self.notification3 = StoredNotification.objects.create(
            message = 'New Notification 3',
            user = self.user1
        )

        self.client = Client()
        self.client.login(username='user1', password='12345')
    
    def test_widget_content_view(self):
        response = self.client.get(reverse('notifications-widget'))
        self.assertEquals(response.status_code, 200)

    def test_count_view(self):
        response = self.client.get(reverse('notifications-count'))
        
        self.assertEquals(response.content, '3')
        
        StoredNotification.objects.mark_all_as_read_for_user(self.user1)
        response = self.client.get(reverse('notifications-count'))
        self.assertEquals(response.content, '0')

        self.assertEquals(response.status_code, 200)


        
