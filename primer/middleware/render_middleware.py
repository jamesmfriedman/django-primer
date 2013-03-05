import json
from dict2xml import dict2xml
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from django.template.loader import select_template
from primer.template.loader import render



__all__ = [
    'RenderMiddleware'
    ]

class RenderMiddleware():
    """
    Middle to handle auto rendering of requests.
    It expects that views now will just return a dict instead of an HttpResponse
    """
    def process_response(self, request, response):
        
        # auto render a dict for a standard request
        if isinstance(response, dict) or isinstance(response, list):

            template_exists = True
            
            if request.is_ajax():
                try:
                    select_template(request.primer['view_template'])
                except TemplateDoesNotExist:
                    template_exists = False

            if request.primer.get('format') == 'debug':
                request.primer['view_template'] = 'primer/format_debug.html'
                resp = render({'debug_data' : json.dumps(response, indent = 4)}, True, request)
                return resp 

            elif request.primer.get('format') == 'xml':
                request.primer['view_template'] = 'primer/format_xml.html'
                resp = render({'xml_data' : dict2xml(response)}, True, request)
                resp['Content-Type'] = 'application/xhtml+xml' 
                return resp 

            elif request.primer.get('format') == 'json' or (request.is_ajax() and not template_exists and (isinstance(response,list) or not response.get('view_template'))):
                request.primer['view_template'] = 'primer/format_json.html'
                resp = render({'json_data' : json.dumps(response)}, True, request)
                resp['Content-Type'] = 'application/json' 
                return resp 

            else:
                return render(response, True, request)

        # default, just return the response
        return response