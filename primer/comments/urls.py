from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.comments.views',

	##
    # prefix: comments
    #
    url(r'^load/$', 'load', name='comments-load'),
    url(r'^post/$', 'post', name='comments-post'),
    url(r'^delete/$', 'delete', name='comments-delete'),
    url(r'^like/$', 'like', name='comments-like'),

)