from django.template.context import RequestContext
from django.shortcuts import render as django_render

from primer.utils import get_request


from django.shortcuts import render as django_render

def render(request = None, template_name = None, dictionary=None, context_instance = None, content_type = None, status = None, current_app = None):
    '''
    Magic render... steal the request from the calling function.
    The template is determinted by whatever is set in args.view_template
    and lastly, pass in any of their arguments

    requires the primer.middleware.AutoMiddleware for the extra request parameters
    '''
    #get the request out of the stack
    if request is None:
        request = get_request()

    #make args an empty dictionary if it is none so we can merge it with kwargs
    if not dictionary:
        dictionary = {}
    elif isinstance(dictionary, list):
        dictionary = {'list_data' : { index: item for index, item in enumerate(dictionary)}} 
    
    #check to see what template we should render
    #if the dev passed one, honor that, otherwise use the one determined in primer middleware
    if not template_name:
        template_name = dictionary.get('view_template') or request.primer.get('view_template')
    
    return django_render(
        request, 
        template_name, 
        dictionary, 
        context_instance = context_instance or RequestContext(request), 
        content_type =  content_type,
        status = status
    )
    