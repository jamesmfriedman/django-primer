from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.feature.views',
    
    url(r'^$', 'home'),
    url(r'^primer/$', 'home', name = 'feature-home'),
    url(r'^primer/setup/$', 'setup', name = 'feature-setup'),
    url(r'^primer/scaffolding/$', 'scaffolding', name = 'feature-scaffolding'),
    url(r'^primer/javascript/$', 'javascript', name = 'feature-javascript'),
    url(r'^primer/notifications/$', 'notifications', name = 'feature-notifications'),
    url(r'^primer/notifications-push-test/$', 'notifications_push_test', name = 'feature-notifications-push-test'),
    url(r'^primer/comments/$', 'comments', name = 'feature-comments'),
    url(r'^primer/media/$', 'media', name = 'feature-media'),
    url(r'^primer/media-upload/$', 'media_upload', name = 'feature-media-upload'),
)
