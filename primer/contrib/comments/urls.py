from django.conf.urls import patterns, url

from .views import LoadView, PostView, DeleteView, LikeView

urlpatterns = patterns('primer.contrib.comments.views',

	##
    # prefix: comments
    #
    url(r'^load/$', LoadView.as_view(), name='comments-load'),
    url(r'^post/$', PostView.as_view(), name='comments-post'),
    url(r'^delete/$', DeleteView.as_view(), name='comments-delete'),
    url(r'^like/$', LikeView.as_view(), name='comments-like'),

)