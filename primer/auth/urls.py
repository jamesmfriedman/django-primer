from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.auth.views',

    # accounts
    url(r'^login/$', 'login', name='login'),
    url(r'^logout/$', 'logout', name='logout'),

)