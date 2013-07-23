from django.contrib.messages.api import get_messages

def notifications(request):
    """
    Returns a lazy 'messages' context variable.
    """

    return_dict = {}

    return_dict['notifications'] = [ m.message for m in get_messages(request)]

    if hasattr(request, '_notifications_count'):
    	return_dict['notifications_count'] = request._notifications_count

    return return_dict