from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.feature.views',
    
    # hello world view
    url(r'^$', 'hello_world'),
    url(r'^primer/$', 'home', name = 'feature-home'),
    url(r'^primer/setup/$', 'setup', name = 'feature-setup'),
    url(r'^primer/get-started/$', 'get_started', name = 'feature-get-started'),
    url(r'^primer/javascript/$', 'javascript', name = 'feature-javascript'),
    url(r'^primer/templating/$', 'templating', name = 'feature-templating'),
    url(r'^primer/notifications/$', 'notifications', name = 'feature-notifications'),
    url(r'^primer/notifications-push-test/$', 'notifications_push_test', name = 'feature-notifications-push-test'),
    url(r'^primer/comments/$', 'comments', name = 'feature-comments'),
    url(r'^primer/media/$', 'media', name = 'feature-media'),
)
