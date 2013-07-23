from django.test import TestCase
from django.contrib.auth.models import User

from ..models import StoredNotification


class StoredNotificationTestCase(TestCase):
   
    def setUp(self):
        super(StoredNotificationTestCase, self).setUp()
        self.user1 = User.objects.create_user('user1', 'user1@test.com', '12345');
        self.user2 = User.objects.create_user('user2', 'user2@test.com', '12345');
        self.user3 = User.objects.create_user('user3', 'user3@test.com', '12345');
        
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
    
    def test_get_for_user(self):
        self.assertEquals(StoredNotification.objects.get_for_user(self.user1).count(), 3)

    def test_mark_all_as_read_for_user(self):
        StoredNotification.objects.mark_all_as_read_for_user(self.user1)
        self.assertEquals(StoredNotification.objects.filter(user = self.user1, read = False).count(), 0)

    def test_add_sender(self):
        self.notification.sender = self.user1
        self.notification.save()

    def test_add_target(self):
        self.notification.target = '#'
        self.notification.save()

    def test_add_data(self):
        self.notification.data = {
            'testing' : 'foo',
            'bar'   : 'baz'
        }

        self.notification.save()
        self.assertIsInstance(self.notification.data, dict)

        self.notification.data = None
        self.notification.save()
        self.assertIsNone(self.notification.data)

    def test_add_type(self):
        self.notification.type = 'foo'
        self.notification.save()

    def test_template(self):
        self.assertIsNotNone(self.notification.template)
        
    


        
