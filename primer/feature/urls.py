from django.conf.urls import patterns, url
from .views import HelloWorldView, HomeView, SetupView, GetStartedView, JavascriptView, TemplatingView, NotificationsView, NotificationsPushTestView, CommentsView, MediaView

urlpatterns = patterns('primer.feature.views',
    
    # hello world view
    url(r'^$', HelloWorldView.as_view()),
    url(r'^primer/$', HomeView.as_view(), name = 'feature-home'),
    url(r'^primer/setup/$', SetupView.as_view(), name = 'feature-setup'),
    url(r'^primer/get-started/$', GetStartedView.as_view(), name = 'feature-get-started'),
    url(r'^primer/javascript/$', JavascriptView.as_view(), name = 'feature-javascript'),
    url(r'^primer/templating/$', TemplatingView.as_view(), name = 'feature-templating'),
    url(r'^primer/notifications/$', NotificationsView.as_view(), name = 'feature-notifications'),
    url(r'^primer/notifications-push-test/$', NotificationsPushTestView.as_view(), name = 'feature-notifications-push-test'),
    url(r'^primer/comments/$', CommentsView.as_view(), name = 'feature-comments'),
    url(r'^primer/media/$', MediaView.as_view(), name = 'feature-media'),
)
