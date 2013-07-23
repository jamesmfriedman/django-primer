from django.conf.urls import patterns, url

from .views import LoginView, LogoutView

urlpatterns = patterns('primer.apps.primer_auth.views',

    # accounts
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),

)