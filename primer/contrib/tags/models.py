from django.db import models
from django.utils.text import slugify
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic

from primer.db.models import PrimerModel


class TagManager(models.Manager):

    def get_for_object(self, obj):
        return self.filter(object_pk = obj.pk, content_type = ContentType.objects.get_for_model(obj)).select_related('tag_entry')

    def set_for_object(self, obj, tag_entry = None, label = None, color = None):
        """
        Creates a tag for an object. Will also create the tag if needed.

        Args:
            obj: the object you are tagging
            tag_entry: the actual tag object or tag objects id
            label: a label to either create or lookup the tag by
            color: the color for the link

        Returns:
            The saved or updated tag object
        """
        if tag_entry != None:
            if isinstance(tag_entry, (int, unicode)):
                tag_entry = TagEntry.objects.get(pk = int(tag_entry))

        elif label:
            tag_entry, created = TagEntry.objects.get_or_create(label = label)

        content_type = ContentType.objects.get_for_model(obj)

        try:
            tag = Tag.objects.get(tag_entry = tag_entry, content_type = content_type, object_pk = obj.pk)
            tag.tag_entry = tag_entry
            if color and tag.color != color:
                tag.color = color
                tag.save()

        except Tag.DoesNotExist:
            tag = Tag(tag_entry = tag_entry, color = color, content_type = content_type, object_pk = obj.pk)
            tag.save()

        return tag
        


class TagEntry(PrimerModel):

    class Meta:
        unique_together = ('label', 'tag')

    label =  models.CharField(max_length = 50)
    tag = models.SlugField(unique = True, blank = True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.tag = self.label
        super(TagEntry, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.tag


class Tag(PrimerModel):

    tag_entry = models.ForeignKey(TagEntry, related_name = 'tags')
    color = models.CharField(max_length = 12, blank = True, null = True)

    content_type = models.ForeignKey(ContentType,
            verbose_name = 'content type',
            related_name = 'content_type_set_for_%(class)s'
    )
    object_pk = models.TextField()
    content_object = generic.GenericForeignKey(ct_field = 'content_type', fk_field = 'object_pk')

    objects = TagManager()

    @property
    def label(self):
        return self.tag_entry.label

    @property
    def tag(self):
        return self.tag_entry.tag

    def __unicode__(self):
        return self.label