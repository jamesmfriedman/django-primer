import inspect
import sys

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

__all__ = (
    'get_request',
    'get_current_user',
    'decode_dict',
    'decode_list',
    'paginate',
    )


def get_request():
    """
    Get the request out of the stack
    """
    frame = None
    try:
        for f in inspect.stack()[1:]:
            frame = f[0]
            code = frame.f_code
            if code.co_varnames and code.co_varnames[0] == 'request':
                return frame.f_locals['request']
    finally:
        del frame
    return None


def get_current_user():
    """
    Gets the current user
    """
    cur_request = get_request()
    if cur_request:
        return cur_request.user
    
    return None



def paginate(obj_list, limit = 10):
    """
    A convenience function for quick pagination

    Returns
        The current page object. To access the paginator you can
        do page.paginator and to get the actual content of the page
        it is page.object_list
    """
    request = get_request()
    
    paginator = Paginator(obj_list, limit) # Show 25 contacts per page
    page = request.REQUEST.get('page', 1)
    
    try:
        items = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        items = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        items = paginator.page(paginator.num_pages)

    return items



def decode_list(data):
    """
    Decodes a unicode list
    """
    rv = []
    for item in data:
        if isinstance(item, unicode):
            item = item.encode('utf-8')
        elif isinstance(item, list):
            item = decode_list(item)
        elif isinstance(item, dict):
            item = decode_dict(item)
        rv.append(item)
    return rv

def decode_dict(data):
    """
    Decodes a multidemsional unicode dict
    Useful for JSON.loads

    Example:
        from primer.utils import decode_dict
        data = json.loads(data, object_hook=decode_dict)
    """
    rv = {}
    for key, value in data.iteritems():
        if isinstance(key, unicode):
           key = key.encode('utf-8')
        if isinstance(value, unicode):
           value = value.encode('utf-8')
        elif isinstance(value, list):
           value = decode_list(value)
        elif isinstance(value, dict):
           value = decode_dict(value)
        rv[key] = value
    return rv
