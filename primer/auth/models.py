from django.contrib.auth.models import User, Group
from django.db import models
from primer.db.models import UUIDField

# Monkey Patch User Model
User.add_to_class('uuid', UUIDField())
User.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
User.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))

# Monkey Patch Group Model
Group.add_to_class('uuid', UUIDField())
Group.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Group.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))