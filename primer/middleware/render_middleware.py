import json
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
        if isinstance(response, dict):

            template_exists = True
            if request.is_ajax():
                try:
                    select_template(request.primer['view_template'])
                except TemplateDoesNotExist:
                    template_exists = False

            if request.is_ajax() and not template_exists and not response.get('view_template'):
                return HttpResponse(json.dumps(response), mimetype='application/json')
            else:
                return render(response, True, request)

        # default, just return the response
        return response