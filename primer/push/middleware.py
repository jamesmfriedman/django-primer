import hashlib
import random
import datetime
import sys

from django.conf import settings
from django.core.urlresolvers import resolve
from django.template.loader import select_template, TemplateDoesNotExist


__all__ = [
    'PushMiddleware'
    ]


class PushMiddleware():
    
    def process_request(self, request):
        if settings.PUSH_SERVICE:
            if not request.session.get('push_channel_id'):
                request.session['push_channel_id'] = hashlib.sha224(request.user.username + str(random.random()) + str(datetime.datetime.utcnow()) ).hexdigest()
        