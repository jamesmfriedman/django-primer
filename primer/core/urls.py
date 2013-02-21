from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.core.views',

    # accounts
    url(r'', include('primer.auth.urls', app_name = 'auth')),

    # notifications
    url(r'^notifications/', include('primer.notifications.urls', app_name = 'notifications')),

    # comments
    url(r'^comments/', include('primer.comments.urls', app_name = 'comments')),

    # media
    url(r'^media/', include('primer.media.urls', app_name = 'media')),

)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'', include('primer.feature.urls', app_name = 'feature')),
    )