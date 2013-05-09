from django.conf.urls import patterns, url

from .views import WidgetContentView, CountView

urlpatterns = patterns('primer.notifications.views',

	##
    # prefix: notifications
    #
    url(r'^widget/$', WidgetContentView.as_view(), name='notifications-widget'),
    url(r'^count/$', CountView.as_view(), name='notifications-count'),

)