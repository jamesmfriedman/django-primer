from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.http import HttpResponse

from primer.notifications import *
from primer.media.forms import UploadFileForm

def home(request):
    return {}


def scaffolding(request):
    return {}


def javascript(request):
    return {}


def setup(request):
    return {}


def templating(request):
    return {}


def media(request):
    upload_form = UploadFileForm()
    upload_obj = Session.objects.get(session_key = request.session.session_key)

    return {
        'upload_form' : upload_form,
        'upload_obj' : upload_obj
    }


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
    stream = User.objects.all()

    return {
        'comment_obj': comment_obj,
        'stream' : stream
    }