import os

from django.forms import MultiValueField, FileField, CharField
from django.core.files import File
from django.core.urlresolvers import reverse
from django.core import validators
from django.conf import settings
from django.core.exceptions import ValidationError

from .widgets import AjaxFileInput


__all__ = (
    'AjaxFileField',
)


class AjaxFileField(MultiValueField):
    widget = AjaxFileInput

    handle_url = None
    multiple = False
    max_uploads = 1
    
    def __init__(self, fields=(), max_uploads = 1, handle_url = None, *args, **kwargs):
        
        self.handle_url = handle_url
        self.max_uploads = max_uploads

        if max_uploads > 1:
            self.multiple = True

        fields = (
            FileField(),
            CharField(),
        )

        super(AjaxFileField, self).__init__(fields, *args, **kwargs)
    

    def clean(self, value):

        if not value[1] in validators.EMPTY_VALUES:

            # split the values apart for the multiple files field
            files = value[1].split(',')
            if not self.multiple and len(files) > 1:
                self._remove_files(files)
                raise ValidationError('Multiple files not allowed')

            if len(files) > self.max_uploads:
                self._remove_files(files)
                raise ValidationError('You can only upload a maximum of %s files' % self.max_uploads)

            # we got our files list, so remove the first value
            value.pop(0)

            # this is dirty, go through and add the right number of file fields
            # so they can all be cleaned
            self.fields = list(self.fields)
            for i in xrange(len(files) - 1):
                self.fields.insert(0, FileField())
            self.fields = tuple(self.fields)

            for f in files:
                file_path = settings.FILE_UPLOAD_TEMP_DIR + os.path.sep + f
                value.insert(0, File(open(file_path)))

        return super(AjaxFileField, self).clean(value)

    def _remove_files(self, files):
        for f in files:
            file_path = settings.FILE_UPLOAD_TEMP_DIR + os.path.sep + f
            os.remove(file_path)


    def compress(self, data_list):
        """
        Grab every item from the list except the junk field
        """
        return data_list[:-1]

    def widget_attrs(self, widget):
        if not self.handle_url:
            self.handle_url = reverse('primer-media-upload')

        attrs = {
            'data-handleurl' : self.handle_url,
            'data-maxuploads' : self.max_uploads,
        }

        if self.multiple:
            attrs['multiple'] = True
        
        return attrs