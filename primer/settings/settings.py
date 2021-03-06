import os
import sys

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
)

def unique(sequence):
    """
    A generator to return a unique set of items from our settings
    This prevents us from adding in something that was already present
    """
    seen = set()
    for item in sequence:
        if item not in seen:
            seen.add(item)
            yield item


def merge_settings(core_settings, primer_settings):
    """
    This merges primer settings in AFTER django settings
    but before any additional settings. This supports the idea
    that PRIMER is a set of extensions for Django, but comes before
    someones additional apps and overrides
    """
    index = len(core_settings)
    for i in range(index):
        item = core_settings[i]
        if item.find('django') != 0:
            index = i
            break

    merged_settings = unique(list(core_settings)[0:index] + primer_settings + list(core_settings)[index:])
    
    return tuple(merged_settings)

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

    # primer
    'primer',
    'primer.core',
    'primer.auth',
    'primer.sessions',
    'primer.sites',
    'primer.notifications',
    'primer.comments',
    'primer.feature',
    'primer.avatars',
    'primer.likes',
    'primer.media',
]

# redfine the InstalledApps tuple
INSTALLED_APPS = merge_settings(settings.INSTALLED_APPS, PRIMER_INSTALLED_APPS)


##
# MIDDLEWARE INJECTION
# inject primers middleware
PRIMER_MIDDLEWARE_CLASSES = [
    'primer.middleware.AutoMiddleware',
    'primer.middleware.RenderMiddleware',
    'primer.push.middleware.PushMiddleware',
    'primer.notifications.middleware.CountMiddleware',
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
    'primer.notifications.context_processors.notifications',
    'primer.template.context_processors.primer',
    'primer.push.context_processors.push_service',
    'primer.template.context_processors.settings',
]

settings.TEMPLATE_CONTEXT_PROCESSORS = getattr(settings, 'TEMPLATE_CONTEXT_PROCESSORS', [])
TEMPLATE_CONTEXT_PROCESSORS = merge_settings(settings.TEMPLATE_CONTEXT_PROCESSORS, PRIMER_TEMPLATE_CONTEXT_PROCESSORS)

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

STATICFILES_FINDERS = merge_settings(settings.STATICFILES_FINDERS, PRIMER_STATICFILES_FINDERS)



# turn the django template loaders into a list and remove the app directories loader
settings.TEMPLATE_LOADERS = list(settings.TEMPLATE_LOADERS)
settings.TEMPLATE_LOADERS.remove('django.template.loaders.app_directories.Loader')
TEMPLATE_LOADERS = merge_settings(settings.TEMPLATE_LOADERS, PRIMER_TEMPLATE_LOADERS)



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
    
