import json
from django import forms
from django.shortcuts import render as django_render
from django.template.context import RequestContext

def render(request, data = {}, view_template = None, context_instance = None, content_type = None, status = 200):
    """
    Renders to a template. This is a loose proxy for Djangos render function as it autofills
    in a lot of the params for you.

    Example:
        return to_template({'test': 'foo'})
    """
    #make args an empty dictionary if it is none so we can merge it with kwargs
    if isinstance(data, list):
        data = {'list_data' : { index: item for index, item in enumerate(data)}} 
    
    #check to see what template we should render
    #if the dev passed one, honor that, otherwise use the one determined in primer middleware

    if not view_template and not 'view_template' in data:
        view_template = request.primer.get('view_template')
    elif not view_template: 
        view_template = data['view_template']

    return django_render(request = request, template_name = view_template, dictionary = data, context_instance = RequestContext(request), content_type = content_type, status = status)


def render_to_template(*args, **kwargs):
    """
    Proxy for render
    """
    return render(*args, **kwargs)

def render_to_json(request, data = {}, status = 200):
    if issubclass(data.__class__, list) or issubclass(data.__class__, dict):
        status = _build_form_errors(data)
        json_data = json.dumps(data)
    else:
        # pass through for possibly already json serialized strings
        json_data = data
    
    resp = render(request, {'json_data' : json_data}, 'primer/format_json.html', status = status)
    resp['Content-Type'] = 'application/json' 
    return resp

def render_to_xml(request, data = {}, status = 200):
    from dict2xml import dict2xml
    status = _build_form_errors(data)
    resp = render(request, {'xml_data' : dict2xml(data)}, 'primer/format_xml.html', status = status)
    resp['Content-Type'] = 'application/xhtml+xml' 
    return resp

def render_to_debug(request, data = {}):
    """
    A useful view for debuggin ajax type requests
    Will serialize the data and display the response
    formatted and syntax highlighted on screen. Allows you
    to use debug toolbar as well.

    Args:
        data: a dict of data to serialize for the xml template
    """
    resp = render(request, {'debug_data' : json.dumps(data, indent = 4)}, 'primer/format_debug.html')
    return resp 

def _build_form_errors(data):
    """
    Handles automatically getting out form errors
    for JSON and XML responses

    Returns:
        status (int): http status code
    """
    status = 200

    if isinstance(data, dict):
    
        for key, item in data.items():

            if isinstance(item, (forms.Form, forms.ModelForm)):
                data['_primer'] = data.get('_primer', {})
                form = item
                if not form.is_valid():

                    status = 400

                    data['_primer']['form_errors'] = dict.fromkeys(form.fields, [])
                    data['_primer']['form_errors']['non_field_errors'] = form.non_field_errors()

                    for field in form.visible_fields():
                        data['_primer']['form_errors'][field.name] = field.errors

                del data[key]

    return status
