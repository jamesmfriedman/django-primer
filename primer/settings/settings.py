import os
import importlib

settings = importlib.import_module(os.environ['DJANGO_SETTINGS_MODULE'])


__all__ = (
	'APP_ROOT',
	'INSTALLED_APPS',
	'MIDDLEWARE_CLASSES',
	'TEMPLATE_CONTEXT_PROCESSORS',
	'TEMPLATE_LOADERS',

	'COMPRESS_URL',
	'COMPRESS_ENABLED',
	'COMPRESS_OFFLINE',

	'PUSH_SERVICE',
	'PUSH_SERVICE_SETTINGS',

	'SESSION_SAVE_EVERY_REQUEST',
	'PRIMER_ROOT',

	'LESS_ROOT',
	'LESS_CSS_PATHS',
	'LESS_PROCESSOR_ENABLED',
	
)

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

	return tuple(list(core_settings)[0:index] + primer_settings + list(core_settings)[index:])

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
	'primer.notifications.context_processors.notifications',
    'primer.template.context_processors.primer',
    'primer.push.context_processors.push_service',
    'primer.template.context_processors.settings',
]

TEMPLATE_CONTEXT_PROCESSORS = merge_settings(settings.TEMPLATE_CONTEXT_PROCESSORS, PRIMER_TEMPLATE_CONTEXT_PROCESSORS)

##
# TEMPLATE LOADER INJECTION
# inject primers template loader
PRIMER_TEMPLATE_LOADERS = [
    'primer.template.loaders.app_directories.Loader'
]

# turn the django template loaders into a list and remove the app directories loader
settings.TEMPLATE_LOADERS = list(settings.TEMPLATE_LOADERS)
settings.TEMPLATE_LOADERS.remove('django.template.loaders.app_directories.Loader')
TEMPLATE_LOADERS = merge_settings(settings.TEMPLATE_LOADERS, PRIMER_TEMPLATE_LOADERS)



PRIMER_ROOT = os.path.abspath(os.path.dirname(__file__) + '/../')

# additional settings used by primer
APP_ROOT = os.path.realpath('.')

# update the session after every request
SESSION_SAVE_EVERY_REQUEST = True

# django compressor settings
COMPRESS_URL = getattr(settings, 'COMPRESS_URL', settings.STATIC_URL)
COMPRESS_ENABLED = getattr(settings, 'COMPRESS_ENABLED', not settings.DEBUG)
COMPRESS_OFFLINE = getattr(settings, 'COMPRESS_OFFLINE', False)

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
	
