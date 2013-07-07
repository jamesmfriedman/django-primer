from django.contrib.auth.views import login as django_login
from django.contrib.auth import logout as django_logout
from django.shortcuts import redirect

from primer.auth import public
from primer.views.generic import PrimerView

class LoginView(PrimerView):
	@public
	def get(self, request, **kwargs):
	    '''
	    Logs a user in.
	    '''
	    return django_login(request)

	@public
	def post(self, request, **kwargs):
	    '''
	    Logs a user in.
	    '''
	    return django_login(request)

class LogoutView(PrimerView):
	@public
	def get(self, request, **kwargs):
	    '''
	    Logs a user out, returns a redirect to the login view
	    '''
	    django_logout(request)
	    return redirect('/')