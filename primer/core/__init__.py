# Monkey patch on our Primer URLs to the main url conf
import importlib
from django.conf import settings
from .urls import urlpatterns

root_url_conf = importlib.import_module(settings.ROOT_URLCONF)
root_url_conf.urlpatterns += urlpatterns
