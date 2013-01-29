"""
This module is for monkey patching stuff onto Django's framework.
It is unlikely that the default Primer app would have any models for itself.
"""
from django.contrib.sites.models import Site
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User, Group
from django.db import models

from primer.db.models import UUIDField

##################################################################################################################
# Custom Abstract Base Models
# Built in model extensions 
# Add onto Djangos Sites Framework
# from django.contrib.sites.models import get_current_site
##################################################################################################################

# Site Model
Site.add_to_class('uuid', UUIDField())
Site.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Site.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))

# User Model
User.add_to_class('uuid', UUIDField())
User.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
User.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))

# Group Model
Group.add_to_class('uuid', UUIDField())
Group.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Group.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))

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