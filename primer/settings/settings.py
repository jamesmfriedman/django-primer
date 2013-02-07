import os
import importlib

settings = importlib.import_module(os.environ['DJANGO_SETTINGS_MODULE'])


__all__ = (
	'APP_ROOT',
	'INSTALLED_APPS',
	'MIDDLEWARE_CLASSES',
	'TEMPLATE_CONTEXT_PROCESSORS',

	'COMPRESS_URL',
	'COMPRESS_ENABLED',
	'COMPRESS_OFFLINE',

	'LESS_CSS_PATHS',

	'PUSH_SERVICE',
	'PUSH_SERVICE_SETTINGS',

	'SESSION_SAVE_EVERY_REQUEST',
	'LESS_ROOT',
)

# additional settings used by primer
APP_ROOT = os.path.realpath('.')

# django compressor settings
COMPRESS_URL = settings.STATIC_URL
COMPRESS_ENABLED = not settings.DEBUG
COMPRESS_OFFLINE = False


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

	return (list(core_settings)[0:index] + primer_settings + list(core_settings)[index:])

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
PRIMER_MIDDLEWARE_CLASSES = (
	'primer.middleware.AutoMiddleware',
    'primer.middleware.RenderMiddleware',
    'primer.push.middleware.PushMiddleware',
    'primer.notifications.middleware.CountMiddleware',
)

MIDDLEWARE_CLASSES = settings.MIDDLEWARE_CLASSES + PRIMER_MIDDLEWARE_CLASSES


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
# LESS CSS PATHS TO BE PROCESSED
# Input LESS file on the left pointing to output CSS on the right
# they should both be relative paths from the root
if hasattr(settings, 'LESS_CSS_PATHS'):
	LESS_CSS_PATHS = settings.LESS_CSS_PATHS
else:
	LESS_CSS_PATHS = {}

# should be set to the name of a push service you want to use
# this can be 'pubnub', 'pusher', or pointing to a custom class
PUSH_SERVICE = None
PUSH_SERVICE_SETTINGS = {}

SESSION_SAVE_EVERY_REQUEST = True

if hasattr(settings, 'LESS_ROOT'):
	LESS_ROOT = settings.LESS_ROOT
else:
	LESS_ROOT = APP_ROOT
