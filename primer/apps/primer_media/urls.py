from django.conf.urls import patterns, include, url

urlpatterns = patterns('primer.apps.primer_media.views',

	##
    # prefix: media
    #
    url(r'^upload/$', 'upload', name='media-upload'),
)