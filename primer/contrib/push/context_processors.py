from django.conf import settings

def push_service(request):

    if settings.PUSH_SERVICE:
        return {
            'push_service' : settings.PUSH_SERVICE.split('.')[-1].lower(),
            'push_channel_id' : request.session.get('push_channel_id') if hasattr(request, 'session') else None,
            'push_pub_key' : settings.PUSH_SERVICE_SETTINGS.get('pub_key'),
            'push_sub_key' : settings.PUSH_SERVICE_SETTINGS.get('sub_key')
        }
    else:
        return {}
       