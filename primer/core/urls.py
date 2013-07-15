from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.core.views',

    # accounts
    url(r'', include('primer.contrib.auth.urls', app_name = 'auth')),

    # notifications
    url(r'^notifications/', include('primer.contrib.notifications.urls', app_name = 'notifications')),

    # comments
    url(r'^comments/', include('primer.contrib.comments.urls', app_name = 'comments')),

    # media
    url(r'^media/', include('primer.contrib.media.urls', app_name = 'media')),

)