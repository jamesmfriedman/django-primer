from django.template.context import RequestContext
from django.shortcuts import render as django_render

from primer.utils import get_request


from django.shortcuts import render as django_render

def render(args=None, use_request_context = True, request=None):
    '''
    Magic render... steal the request from the calling function.
    The template is determinted by whatever is set in args.template
    and lastly, pass in any of their arguments

    requires the primer.middleware.AutoMiddleware for the extra request parameters
    '''
    #get the request out of the stack
    if request is None:
        request = get_request()

    #make args an empty dictionary if it is none so we can merge it with kwargs
    if not args:
        args = {}
    
    #check to see what template we should render
    #if the dev passed one, honor that, otherwise use the one determined in primer middleware
    if not 'view_template' in args:
        args['view_template'] = request.primer.get('view_template')

    if use_request_context:
        return django_render(request, args['view_template'], args, context_instance=RequestContext(request))
    else:
        return django_render(request, args['view_template'], args)