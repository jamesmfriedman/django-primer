from django.db import models

from fields import UUIDField
from mptt.models import MPTTModel, TreeForeignKey

##################################################################################################################
# Custom Abstract Base Models
##################################################################################################################
class PrimerModel(models.Model):
    """
    Primer model adds the following fields to a model
    - created
    - modified
    - UUID
    """
    class Meta:
        abstract = True
        get_latest_by = 'created'
    
    created = models.DateTimeField(auto_now_add=True, editable = False, blank = True, db_index = True)
    modified = models.DateTimeField(auto_now=True, blank = True)
    uuid = UUIDField()


class PrimerTreeModel(MPTTModel):
    class Meta:
        abstract = True

    parent = TreeForeignKey('self', null = True, blank = True, related_name = 'children')