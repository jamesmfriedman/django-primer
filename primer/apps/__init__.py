import importlib
from django.conf import settings

from primer.conf.urls import urlpatterns

root_url_conf = importlib.import_module(settings.ROOT_URLCONF)
root_url_conf.urlpatterns += urlpatterns




