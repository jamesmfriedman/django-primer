from django.conf.urls import patterns, include, url

urlpatterns = patterns('',

    # accounts
    url(r'', include('primer.apps.primer_auth.urls', app_name = 'auth')),

    # notifications
    url(r'^notifications/', include('primer.apps.primer_notifications.urls', app_name = 'notifications')),

    # comments
    url(r'^comments/', include('primer.apps.primer_comments.urls', app_name = 'comments')),

    # media
    url(r'', include('primer.apps.primer_media.urls', app_name = 'media')),

)