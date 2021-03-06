"""
A set of request processors that return dictionaries to be merged into a
template context. Each function takes the request object as its only parameter
and returns a dictionary to add to the context.

These are referenced from the setting TEMPLATE_CONTEXT_PROCESSORS and used by
RequestContext.
"""
from django.conf import settings as django_settings
from primer.notifications import Notification

def primer(request):
    '''Adds variables set in primer/middleware/AutoMiddlware as variables in the template'''
    if hasattr(request, 'primer'):
    	args = request.primer
    else:
    	args = {}
    return args


def settings(request):
    return {
        'settings' : django_settings
    }