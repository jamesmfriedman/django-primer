from django.contrib.auth.models import User, UserManager, Group
from django.utils.translation import ugettext_lazy as _
from django.db import models
from django.db.models.query import QuerySet

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


class TeamQuerySet(QuerySet):
    def active(self, *args, **kwargs):
        return self.filter(is_active = True, *args, **kwargs)   

class TeamManager(models.Manager):
    def get_query_set(self):
        return TeamQuerySet(self.model, using=self._db)
    

class TeamActiveManager(TeamManager):
    def get_query_set(self):
        super(TeamActiveManager, self).get_query_set().filter(is_active = False)

class Team(PrimerModel):
    """
    Teams are Primers version of groups. They are for user facing groupings
    that support heirarchies
    """
    name = models.CharField(_('name'), max_length=64, db_index = True)
    members = models.ManyToManyField(User, 
        blank = True,
        through = 'Membership',
        related_name = 'teams',
    )

    parent = models.ForeignKey('self', null = True, blank = True, on_delete = models.SET_NULL)
    type = models.CharField(max_length = 32, db_index = True, default = 'team')
    locked = models.BooleanField(default = False)
    expiration = models.DateTimeField(blank = True, null = True)
    is_active = models.BooleanField(default = True, db_index = True)

    objects = TeamManager()
    active = TeamActiveManager()
    
    def __unicode__(self):
        return self.name

    def natural_key(self):
        return (self.name,)


class UserActiveManager(UserManager):
    """
    Filters out users who are inactive
    """
    def get_query_set(self):
        return super(UserActiveManager, self).get_query_set().filter(is_active = True)

####################################################
# Additions to User Model
####################################################
User.add_to_class('uuid', UUIDField())
User.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
User.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))
User.add_to_class('active', UserActiveManager())


####################################################
# Additions to Group Model
####################################################
Group.add_to_class('uuid', UUIDField())
Group.add_to_class('created', models.DateTimeField(auto_now_add=True, editable = False, blank = True, null = True))
Group.add_to_class('modified', models.DateTimeField(auto_now=True, blank = True, null = True))
