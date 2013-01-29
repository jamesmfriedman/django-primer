from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.notifications.views',

	##
    # prefix: notifications
    #
    url(r'^widget/$', 'widget_content', name='notifications-widget'),
    url(r'^count/$', 'count', name='notifications-count'),

)