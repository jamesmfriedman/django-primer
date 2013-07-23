import os
import sys
from .utils import merge_settings, merge_primer_settings

settings = sys.modules.get(os.environ['DJANGO_SETTINGS_MODULE'])


__all__ = (
    'APP_ROOT',
    'INSTALLED_APPS',
    'MIDDLEWARE_CLASSES',
    'STATICFILES_FINDERS',
    'TEMPLATE_CONTEXT_PROCESSORS',
    'TEMPLATE_LOADERS',

    'COMPRESS_URL',
    'COMPRESS_ENABLED',
    'COMPRESS_OFFLINE',
    'COMPRESS_ROOT',

    'PUSH_SERVICE',
    'PUSH_SERVICE_SETTINGS',

    'SESSION_SAVE_EVERY_REQUEST',
    'PRIMER_ROOT',
    'STATIC_ROOT',

    'LESS_ROOT',
    'LESS_CSS_PATHS',
    'LESS_PROCESSOR_ENABLED',    

    'LOGIN_URL',
    'LOGIN_REDIRECT_URL',
)

##
# PRIMER APP INJECTION
# we will inject our primer installed apps after djangos, but before anyone elses
# find the index to inject primer at apps at
PRIMER_INSTALLED_APPS = [
    
    # django
    'django.contrib.comments',

    # 3rd party
    'compressor',
    'crispy_forms', 
    'storages',   
    'mptt',  

    # primer
    'primer',
    'primer.apps.primer_auth', 
    'primer.apps.primer_push',
    'primer.apps.primer_notifications',
    'primer.apps.primer_comments',
    'primer.apps.primer_avatars',
    'primer.apps.primer_likes',
    'primer.apps.primer_tags',
    'primer.apps.primer_media',
]

# redfine the InstalledApps tuple
INSTALLED_APPS = merge_primer_settings(settings.INSTALLED_APPS, PRIMER_INSTALLED_APPS)

##
# MIDDLEWARE INJECTION
# inject primers middleware
PRIMER_MIDDLEWARE_CLASSES = [
    'primer.apps.primer_push.middleware.PushMiddleware',
]

MIDDLEWARE_CLASSES = merge_settings(settings.MIDDLEWARE_CLASSES, PRIMER_MIDDLEWARE_CLASSES)


##
# CONTEXT PROCESSOR INJECTION
# inject primers template context processors
PRIMER_TEMPLATE_CONTEXT_PROCESSORS = [
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.core.context_processors.tz',
    
    'primer.apps.primer_notifications.context_processors.notifications',
    'primer.apps.primer_push.context_processors.push_service',
    'primer.template.context_processors.primer',
]

settings.TEMPLATE_CONTEXT_PROCESSORS = getattr(settings, 'TEMPLATE_CONTEXT_PROCESSORS', [])
TEMPLATE_CONTEXT_PROCESSORS = merge_primer_settings(settings.TEMPLATE_CONTEXT_PROCESSORS, PRIMER_TEMPLATE_CONTEXT_PROCESSORS)

##
# TEMPLATE LOADER INJECTION
# inject primers template loader
PRIMER_TEMPLATE_LOADERS = [
    'primer.template.loaders.app_directories.Loader'
]

##
# STATIC FILE FINDERS
# inject primers static file finders
# List of finder classes that know how to find static files in
# various locations.
PRIMER_STATICFILES_FINDERS = [
    'compressor.finders.CompressorFinder'
]

STATICFILES_FINDERS = merge_primer_settings(settings.STATICFILES_FINDERS, PRIMER_STATICFILES_FINDERS)

# turn the django template loaders into a list and remove the app directories loader
settings.TEMPLATE_LOADERS = list(settings.TEMPLATE_LOADERS)
settings.TEMPLATE_LOADERS.remove('django.template.loaders.app_directories.Loader')
TEMPLATE_LOADERS = merge_primer_settings(settings.TEMPLATE_LOADERS, PRIMER_TEMPLATE_LOADERS)

LOGIN_URL = getattr(settings, 'LOGIN_URL', '/login/')
LOGIN_REDIRECT_URL = getattr(settings, 'LOGIN_REDIRECT_URL', '/')

# additional settings used by primer
APP_ROOT = os.path.realpath('.')
STATIC_ROOT = getattr(settings, 'STATIC_ROOT') or os.path.normpath(os.path.realpath('.') + '/static')


PRIMER_ROOT = os.path.abspath(os.path.dirname(__file__) + '/../')

# update the session after every request
SESSION_SAVE_EVERY_REQUEST = False

# django compressor settings
COMPRESS_URL = getattr(settings, 'COMPRESS_URL', settings.STATIC_URL)
COMPRESS_ENABLED = getattr(settings, 'COMPRESS_ENABLED', not settings.DEBUG)
COMPRESS_OFFLINE = getattr(settings, 'COMPRESS_OFFLINE', False)
COMPRESS_ROOT = getattr(settings, 'COMPRESS_ROOT', STATIC_ROOT)

# should be set to the name of a push service you want to use
# this can be 'pubnub', 'pusher', or pointing to a custom class
PUSH_SERVICE = getattr(settings, 'PUSH_SERVICE', None)
PUSH_SERVICE_SETTINGS = getattr(settings, 'PUSH_SERVICE_SETTINGS', {})


##
# LESS CSS PATHS TO BE PROCESSED
# Input LESS file on the left pointing to output CSS on the right
# they should both be relative paths from the root
LESS_CSS_PATHS = getattr(settings, 'LESS_CSS_PATHS', {})
LESS_ROOT = getattr(settings, 'LESS_ROOT', APP_ROOT)
LESS_PROCESSOR_ENABLED = getattr(settings, 'LESS_PROCESSOR_ENABLED', settings.DEBUG)
