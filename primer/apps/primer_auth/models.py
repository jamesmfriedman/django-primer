import operator 

from django.contrib.auth.models import User, UserManager, Group
from django.utils.translation import ugettext_lazy as _
from django.db import models
from django.db.models import Q
from django.db.models.query import QuerySet

from mptt.managers import TreeManager

from primer.db.models import UUIDField, PrimerModel, PrimerTreeModel

################################################################################################
# Memberships
################################################################################################
class Membership(PrimerModel):
    """
    A class for defining additional information on memberships
    """
    user = models.ForeignKey(User, related_name = 'memberships')
    team = models.ForeignKey('Team')
    role = models.CharField(max_length = 255, default = 'member', db_index = True)
    is_admin = models.BooleanField(default = False)

    class Meta:
        unique_together = ('user', 'team')

    def __unicode__(self):
        return '%s > %s (%s)' % (self.team.name, self.user.username, self.role)


################################################################################################
# Teams
################################################################################################
class TeamQuerySet(QuerySet):
    def active(self, *args, **kwargs):
        return self.filter(is_active = True, *args, **kwargs)   


class TeamManager(models.Manager):
    """
    Default Team Manager
    """
    def get_query_set(self):
        return TeamQuerySet(self.model, using = self._db)

    def get_members(self, active = True, implied = False):
        """
        Gets the members of a Team

        Args:
            active (bool): whether or not to get active or all users
            implied (bool): get members of subgroups

        Returns:
            A QuerySet of users
        """
        if active:
            users = User.active.all()
        else:
            users = User.objects.all()

        if implied:
            teams = self.get_queryset_descendants()
        else: 
            teams = self.all()

        return users.filter(teams__in = teams).distinct()


    def get_queryset_descendants(self, include_self = True): 
        """
        Gets a the MPTT descendants of a queryset
        Found and modified from 
        http://stackoverflow.com/questions/5722767/django-mptt-get-descendants-for-a-list-of-nodes

        Args:
            include_self (bool): Whether or not include the root level groups.

        Returns:
            A QuerySet of Teams
        """   
        filters = [] 
        for node in self.all(): 
            lft, rght = node.lft, node.rght 
            if include_self: 
                lft -=1 
                rght += 1 
            filters.append(Q(tree_id = node.tree_id, lft__gt = lft, rght__lt = rght)) 
        q = reduce(operator.or_, filters) 
        return self.model.objects.filter(q) 
    

class TeamActiveManager(TeamManager):
    """
    Team manager that will only return active users. Team.active.filter()...
    """
    def get_query_set(self):
        super(TeamActiveManager, self).get_query_set().filter(is_active = False)
        

class Team(PrimerTreeModel, PrimerModel):
    """
    Teams are Primers version of groups. They are for user facing groupings
    that support heirarchies
    """
    name = models.CharField(_('name'), max_length=64, db_index = True)
    created_by = models.ForeignKey(User, blank = True, null = True)
    members = models.ManyToManyField(User, 
        blank = True,
        through = 'Membership',
        related_name = 'teams',
    )

    type = models.CharField(max_length = 32, db_index = True, default = 'team')
    locked = models.BooleanField(default = False)
    expiration = models.DateTimeField(blank = True, null = True)
    is_active = models.BooleanField(default = True, db_index = True)

    objects = TeamManager()
    active = TeamActiveManager()
    tree = TreeManager()
    
    def __unicode__(self):
        return self.name

    def natural_key(self):
        return (self.name,)


################################################################################################
# Users
################################################################################################
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
