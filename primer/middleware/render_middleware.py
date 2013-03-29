import json
from dict2xml import dict2xml
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from django.template.loader import select_template
from primer.template.loader import render
from django import forms


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
                    templates = request.primer['view_template']
                    if isinstance(response, dict) and response.get('view_template'):
                        templates = [response.get('view_template')]
                    select_template(templates)
                except TemplateDoesNotExist:
                    template_exists = False

            # At this point, we are dealing with json or xml data    
            if request.primer.get('format') in ['debug', 'xml', 'json'] or (request.is_ajax() and not template_exists):

                status = 200

                if isinstance(response, dict):
                    response['_primer'] = response.get('_primer', {})

                    for key, item in response.items():

                        if isinstance(item, (forms.Form, forms.ModelForm)):
                            form = item
                            if not form.is_valid():

                                status = 400

                                response['_primer']['form_errors'] = dict.fromkeys(form.fields, [])
                                response['_primer']['form_errors']['non_field_errors'] = form.non_field_errors()

                                for field in form.visible_fields():
                                    response['_primer']['form_errors'][field.name] = field.errors

                            del response[key]                               



                if request.primer.get('format') == 'debug':
                    request.primer['view_template'] = 'primer/format_debug.html'
                    resp = render(request, dictionary = {'debug_data' : json.dumps(response, indent = 4)}, status = status)
                    return resp 

                elif request.primer.get('format') == 'xml':
                    request.primer['view_template'] = 'primer/format_xml.html'
                    resp = render(request, dictionary = {'xml_data' : dict2xml(response)}, status = status)
                    resp['Content-Type'] = 'application/xhtml+xml' 
                    return resp 

                elif request.primer.get('format') == 'json' or (request.is_ajax() and not template_exists):
                    request.primer['view_template'] = 'primer/format_json.html'
                    resp = render(request, dictionary = {'json_data' : json.dumps(response)}, status = status)
                    resp['Content-Type'] = 'application/json' 
                    return resp 

            else:
                return render(request = request, dictionary = response)

        # default, just return the response
        return response