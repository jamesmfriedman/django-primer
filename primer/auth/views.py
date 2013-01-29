from django.contrib.auth.views import login as django_login
from django.contrib.auth import logout as django_logout
from django.shortcuts import redirect
from django.core.urlresolvers import reverse


#@public
def login(request, **kwargs):
    '''
    Logs a user in.
    '''
    return django_login(request)


#@public
def logout(request, **kwargs):
    '''
    Logs a user out, returns a redirect to the login view
    '''
    django_logout(request)
    return redirect(reverse('login'))