from django.db import models
from django.contrib.sites.models import Site
from primer.db.models import UUIDField

# Monky Patch Site Model
Site.add_to_class('uuid', UUIDField())
Site.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Site.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))