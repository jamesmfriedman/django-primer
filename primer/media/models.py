import os
import uuid
import mimetypes

from django.db import models
from django.db.models.signals import pre_delete
from django.core.files import File
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.contrib.auth.models import User

from django.core.files.storage import default_storage
from django.core.files.storage import FileSystemStorage
from storages.backends.s3boto import S3BotoStorage

from primer.db.models import PrimerModel
from primer.utils import get_current_user


def get_upload_path(instance, filename):
        return os.path.join(instance.pathname, instance.filename)


class MediaManager(models.Manager):

    def create_from_file(self, media_file, storage = None, title = None, links = None):
        """
        Create a new Media objecy from file, works with uploaded files or any other referenced file

        Arguments:
            media_file: the actual file that will become the media object
            title: a human readable label for the file. This is not the filename, this is just optional text
            links: a model object to link this media to, can be an object or iterable of objects

        Useage:
            Media.objects.create_from_file(my_file, 'Awesome Picture', User.objects.get(pk = 1))
        """
        f = File(media_file)
        
        original_filename = f.name
        base_filename, extension = os.path.splitext(f.name)
        filename = str(uuid.uuid4()) + extension
        pathname = 'media/%s/%s/' % (filename[0], filename[1])
        mimetype, extra = mimetypes.guess_type(f.name)
        mimetype = mimetype or 'text/plain'

        media = Media.objects.create(
            user = get_current_user(),
            title = title or '',
            filename = filename,
            file = f,
            original_filename = original_filename,
            pathname = pathname,
            mimetype = mimetype,
            extension = extension,
            storage = storage or Media.STORAGE_DEFAULT,
            filesize = f.size
        )

        # handle any media links we have
        if links:
            
            links_to_create = []

            # convert our links into an iterable of objects
            if not hasattr(links, '__iter__'):
                links = [links]

            for link in links:

                # we can only link to actual model objects
                if not isinstance(link, models.Model):
                    raise Exception('Link must be a model instance')

                media_link = MediaLink(
                    media = media,
                    content_type = ContentType.objects.get_for_model(link),
                    object_id = link.pk
                )

                links_to_create.append(media_link)
            
            # bulk create our links
            MediaLink.objects.bulk_create(links_to_create)

        return media

        
class Media(PrimerModel):
    """
    The Media model is for handling uploads and files in multiple storage systems.
    """

    # define our storage mechanisms as ints
    STORAGE_DEFAULT = 1
    STORAGE_FILESYSTEM = 2
    STORAGE_S3 = 3

    # a dict mapping of our ints to our actual storage classes
    STORAGES = {
        STORAGE_DEFAULT     : default_storage.__class__,
        STORAGE_FILESYSTEM  : FileSystemStorage,
        STORAGE_S3          : S3BotoStorage
    }

    # our storage choices
    STORAGE_CHOICES = (
        (STORAGE_DEFAULT, 'Default'),
        (STORAGE_FILESYSTEM, 'Filesystem'),
        (STORAGE_S3, 'Amazon S3')
    )

    user = models.ForeignKey(User, blank = True, null = True)

    # a short label for the media object, i.e. Johns Picture
    title = models.CharField(max_length = 255, blank = True)

    filename = models.CharField(max_length = 255)
    original_filename = models.CharField(max_length = 255)
    
    # directory of file
    pathname = models.CharField(max_length = 255)

    # the folder where all media will be stored, should use a custom storage
    file = models.FileField(upload_to = get_upload_path)
    storage = models.IntegerField(choices = STORAGE_CHOICES, default = STORAGE_DEFAULT)
    
    # you can save thumbnails related to this media in the db
    derived_media = models.ForeignKey('self', blank = True, null = True, related_name = 'derived')

    # info for images
    caption = models.TextField(blank = True)
    copyright = models.CharField(max_length = 255, blank = True)
    
    # file meta information
    extension = models.CharField(max_length = 255)
    mimetype = models.CharField(max_length = 127)
    width = models.IntegerField(null = True, blank = True)
    height = models.IntegerField(null = True, blank = True)
    filesize = models.IntegerField(null = True, blank = True)

    objects = MediaManager()

    class Meta:
        verbose_name_plural = 'media'


    def __init__(self, *args, **kwargs):

        super(Media, self).__init__(*args, **kwargs)
        
        # set storage class for our file
        self.file.storage = self.get_storage()


    @classmethod
    def delete_file_signal_handler(cls, sender, instance, **kwargs):
        """
        A signal handler for deleting the media object that deletes the actual file
        """
        instance.file.storage.delete(instance.file.name)

    def get_storage(self):
        """
        Gets the storage class for a media object based on its storage field enum setting
        """
        return self.STORAGES.get(self.storage, default_storage)()

    #Proxy Methods for storage class
    def accessed_time(self):
        """
        Proxy for storage class accessed_time
        """
        return self.file.storage.accessed_time(self.file.name)

    def created_time(self):
        """
        Proxy for storage class created_time
        """
        try:
            time = self.file.storage.created_time(self.file.name)
        except NotImplementedError:
            time = self.created
        return time

    def exists(self):
        """
        Proxy for storage class exists
        """
        return self.file.storage.exists(self.file.name)

    def get_available_name(self):
        """
        Proxy for storage class get_available_name
        """
        return self.file.storage.get_available_name(self.file.name)

    def get_valid_name(self):
        """
        Proxy for storage class get_valid_name
        """
        return self.file.storage.get_valid_name(self.file.name)

    def listdir(self):
        """
        Proxy for storage class listdir
        """
        return self.file.storage.get_valid_name(self.path)

    def modified_time(self):
        """
        Proxy for storage class modified_time
        """
        try:
            time = self.file.storage.modified_time(self.file.name)
        except NotImplementedError:
            time = self.modified
        return time

    def open(self, mode = 'rb'):
        """
        Proxy for storage class open
        """
        return self.file.storage.open(self.file.name, mode)

    def path(self):
        """
        Proxy for storage class path
        """
        return self.file.storage.path(self.file.name)

    def size(self):
        """
        Proxy for storage class size
        """
        return self.file.storage.size(self.file.name)

    def url(self):
        """
        Proxy for storage class url
        """
        return self.file.storage.url(self.file.name)

    def get_absolute_url(self):
        """
        Returns the media objects url
        """
        return self.url()

    def __unicode__(self):
        return self.original_filename

pre_delete.connect(Media.delete_file_signal_handler, sender=Media)


class MediaLink(PrimerModel):
    """
    The MediaLink model can be used by any other model using generic relationships.
    """
    content_type = models.ForeignKey(ContentType)
    object_id = models.TextField()
    owner = generic.GenericForeignKey()
    media = models.ForeignKey(Media, related_name='links')