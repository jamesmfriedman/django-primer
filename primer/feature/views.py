from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

from primer.notifications import *

def home(request):
    return {}

def scaffolding(request):
    return {}

def javascript(request):
    return {}

def setup(request):
    return {}

def notifications(request):

    InfoNotification(
        message = 'Hello world from the notifications framework!',
    ).send()

    return {}


def notifications_push_test(request):
    InfoNotification(
        message = 'Push notifications are working!',
        data = {'parent': '#test-push-notifications-container'},
        push = True,
    ).send()
    return {}


def comments(request):
    
    comment_obj = Session.objects.get(session_key = request.session.session_key)

    return {
        'comment_obj': comment_obj
    }