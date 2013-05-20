from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.http import HttpResponse

from primer.notifications import *
from primer.media.forms import UploadFileForm
from primer.views.generic import PrimerView


class HelloWorldView(PrimerView):
    def get(self, request):
        return self.to_template()


class HomeView(PrimerView):
    def get(self, request):
        return self.to_template()


class GetStartedView(PrimerView):
    def get(self, request):
        return self.to_template()


class JavascriptView(PrimerView):
    def get(self, request):
        return self.to_template()


class SetupView(PrimerView):
    def get(self, request):
        return self.to_template()


class TemplatingView(PrimerView):
    def get(self, request):
        return self.to_template()


class MediaView(PrimerView):

    def get(self, request):
        upload_form = UploadFileForm()
        upload_obj = Session.objects.get(session_key = request.session.session_key)

        return self.to_template({
            'upload_form' : upload_form,
            'upload_obj' : upload_obj
        })


class NotificationsView(PrimerView):

    def get(self, request):

        InfoNotification(
            message = 'Hello world from the notifications framework!',
            store = 1
        ).send()

        return self.to_template()


class NotificationsPushTestView(PrimerView):
    
    def get(self, request):
        InfoNotification(
            message = 'Push notifications are working!',
            data = {'parent': '#test-push-notifications-container'},
            push = True,
        ).send()
        
        return HttpResponse()


class CommentsView(PrimerView):
    
    def get(self, request):
        comment_obj = Session.objects.get(session_key = request.session.session_key)
        stream = User.objects.all()

        return self.to_template({
            'comment_obj': comment_obj,
            'stream' : stream
        })