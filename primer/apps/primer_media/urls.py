from django.conf.urls import patterns, url

from .views import UploadView

urlpatterns = patterns('primer.apps.primer_media.views',

    url(r'^media-upload/$', UploadView.as_view(), name='primer-media-upload'),
)