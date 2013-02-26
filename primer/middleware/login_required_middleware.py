from functools import partial

from django.shortcuts import redirect
from django.conf import settings


__all__ = [
    'LoginRequiredMiddleware',
    ]

class LoginRequiredMiddleware():
    '''
    This middleware flips Djangos default login_required usage. By default, all views are login required
    You can use the @public decorator loacted in primer.auth to make a function publically accessible
    '''
    def process_view(self, request, view_func, view_args, view_kwargs):
        '''Checks to see if the view is publically accessible or not'''
        while isinstance(view_func, partial):  # if partial - use original function for authorization
            view_func = view_func.func
 
        if not self.is_public(view_func):
            if request.user.is_authenticated():     # only extended checks are needed
                return None
 
            return self.redirect_to_login(request.get_full_path())  # => login page
 
    def redirect_to_login(self, original_target, login_url=settings.LOGIN_URL):
        '''Redirects to the login page, with a get param for next'''
        return redirect("%s?%s=%s" % (login_url, 'next', original_target))

    def is_public(self, function):
        
        result = False

        '''Checks to see if a view has been flagged with the @public decorator'''
        try:                                    # cache is found
            return function.is_public_view
        except AttributeError:                  # cache is not found
            
            # here we avoide modules that have been deemed public
            if hasattr(settings, 'PUBLIC_MODULES'):
                for module in settings.PUBLIC_MODULES:
                    if function.__module__.startswith(module):
                        result = True
                        break
    
            try:                                # try to recreate cache
                function.is_public_view = result
            except AttributeError:
                pass
     
            return result