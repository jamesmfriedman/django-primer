from django.conf import settings
from .models import generate_channel_name


__all__ = [
    'PushMiddleware'
    ]


class PushMiddleware():
    
    def process_request(self, request):
    	"""
    	This middleware assigns a channel id if it is missing from the session
    	"""
        if settings.PUSH_SERVICE and not request.session.get('push_channel_id'):
            if request.user.is_authenticated():
                request.session['push_channel_id'] = request.user.channel.name
            else:
                request.session['push_channel_id'] = generate_channel_name()