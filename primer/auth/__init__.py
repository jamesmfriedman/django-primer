from functools import partial

def public(function):
    '''
    Decorator for public views that do not require authentication
    '''
    orig_func = function
    while isinstance(orig_func, partial):  # if partial - use original function for authorization
        orig_func = orig_func.func
    orig_func.is_public_view = True
 
    return function
