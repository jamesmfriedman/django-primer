'''
Site Template Loader

This module monkey patches Djangos app directories loader to make it use templates
from apps that are installed farthest down this list. This allows for a more
versatile override system for templates, instead the loader using first found

Use this module by adding it to TEMPLATE_LOADERS in settings.py
'''

import django.template.loaders.app_directories

from django.template.loaders.app_directories import Loader
from django.template.loaders.app_directories import app_template_dirs


# allow the loader to be imported by settings.py
__all__ = [
    'Loader'
]

# convert app_template_dirs back to list since it is a tuple
app_template_dirs = list(app_template_dirs)

# reverse it to respect the new ordering
app_template_dirs.reverse()

# override the app_template_dirs value in the app loader
django.template.loaders.app_directories.app_template_dirs = tuple(app_template_dirs)

