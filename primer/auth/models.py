from django.contrib.auth.models import User, Group
from django.utils.translation import ugettext_lazy as _
from django.db import models
from primer.db.models import UUIDField, PrimerModel


class Membership(PrimerModel):
    """
    A class for defining additional information on memberships
    """
    user = models.ForeignKey('User')
    team = models.ForeignKey('Team')
    role = models.CharField(max_length = 255, default = 'member', db_index = True)
    is_admin = models.BooleanField(default = False)

    class Meta:
        unique_together = ('user', 'team')

    def __unicode__(self):
        return '%s > %s (%s)' % (self.team.name, self.user.username, self.role)


class Team(PrimerModel):
    """
    Teams are Primers version of groups. They are for user facing groupings
    that support heirarchies
    """
    name = models.CharField(_('name'), max_length=64)
    members = models.ManyToManyField(User, 
        blank = True,
        through = 'Membership',
        related_name = 'teams',
    )

    parent = models.ForeignKey('self', null = True, blank = True, on_delete = models.SET_NULL)
    type = models.CharField(max_length = 32, db_index = True, default = 'team')
    locked = models.BooleanField(default = False)
    expiration = models.DateTimeField(blank = True, null = True)
    
    def __unicode__(self):
        return self.name

    def natural_key(self):
        return (self.name,)


####################################################
# Additions to User Model
####################################################
User.add_to_class('uuid', UUIDField())
User.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
User.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))


####################################################
# Additions to Group Model
####################################################
Group.add_to_class('uuid', UUIDField())
Group.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Group.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))
