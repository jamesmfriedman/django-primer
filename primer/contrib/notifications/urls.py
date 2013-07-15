from django.conf.urls import patterns, url

from .views import WidgetContentView, CountView, AllView

urlpatterns = patterns('primer.contrib.notifications.views',

	##
    # prefix: notifications
    #
    url(r'^$', AllView.as_view(), name='notifications-all'),
    url(r'^widget/$', WidgetContentView.as_view(), name='notifications-widget'),
    url(r'^count/$', CountView.as_view(), name='notifications-count'),
    

)