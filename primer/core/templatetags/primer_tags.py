import re
from urllib2 import urlopen

from django import template
from django.template import loader
from django.template.loader import render_to_string
from django.utils.html import escape
from django.core.urlresolvers import reverse, NoReverseMatch, resolve

from primer.utils import get_request


register = template.Library()

##################################################################################################################
# Template Filters
##################################################################################################################



##################################################################################################################
# Template Tags
##################################################################################################################


@register.tag
def include_raw(parser, token):
    """ 
    Performs a template include without parsing the context, just dumps the template in.
    """
    bits = token.split_contents()
    if len(bits) != 2:
        raise TemplateSyntaxError, "%r tag takes one argument: the name of the template to be included" % bits[0]
 
    template_name = bits[1]
    if template_name[0] in ('"', "'") and template_name[-1] == template_name[0]:
        template_name = template_name[1:-1]
 
    source, path = load_template_source(template_name)
 
    return template.TextNode(source)


@register.simple_tag
def active(patterns, tag = 'active', exact = False, *args):
    """
    Checks if a given regex pattern is the current request path.
    Useful for seeing if a current menu item is active.

    Arguments:
        patterns: a pattern for URL reverse or a regex. Can be a string separated by commas for multiple
        tag: an optional string to return if the pattern is matched. Defaults to active.
        exact: whether an exact match is required

    Usage:
         <a class="{% active "^/services/" %}" href="/services/">Services</a>
    """
    request = get_request()

    patterns = patterns.split(',')

    for pattern in patterns:
        try:
            pattern = reverse(pattern, args=args)
        except NoReverseMatch:
            pass

        if exact:
            if request.path == pattern:
                return tag
        else:
            if re.search(pattern, request.path):
                return tag
    return ''



@register.simple_tag()
def build_url_params(params):
    """
    Tag that takes a dict in a template and turns it into a url
    params string, including the ?. Only accepts things that
    can be converted into a string

    Arugments
        obj: a dictionary
    """
    data = []

    # put our params into our extra data
    for item in params.items():
        key = str(item[0])
        val = str(item[1])
        data.append( '%s=%s' % (key,val) )

    if len(data):
        return '?%s' % '&'.join(data)
    else:
        return ''



