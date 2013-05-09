import hashlib
import random
import datetime

from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in

from primer.db.models import PrimerModel

#####################################################################################
# Signals
#####################################################################################
def generate_channel_name():
    return hashlib.sha224(str(random.random()) + str(random.random()) + str(datetime.datetime.utcnow()) ).hexdigest()

def user_logged_in_reciever(sender, user, request, **kwargs):
    obj, created = Channel.objects.get_or_create(user = user)
    request.session['push_channel_id'] = obj.name

user_logged_in.connect(user_logged_in_reciever)

#####################################################################################
# Models
#####################################################################################
class Channel(PrimerModel):

    user = models.OneToOneField(User, related_name = 'channel')
    name = models.TextField(default = generate_channel_name)

    def __unicode__(self):
        return self.name


