from django.db import models
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

# Sessions Model
# here will add an explicit user ID to the session table
Session.add_to_class('user', models.ForeignKey(User, blank = True, null = True, related_name = 'sessions'))

def session_save(self, *args, **kwargs):
    user_id = self.get_decoded().get('_auth_user_id')
    if ( user_id != None ):
        self.user_id = user_id

    # Call the "real" save() method.
    super(Session, self).save(*args, **kwargs)

Session.add_to_class('save', session_save)