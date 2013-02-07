from django import forms
from django.contrib.contenttypes.models import ContentType
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field

from models import Media
from primer.utils import get_current_user

class UploadFileForm(forms.Form):
    
    file          = forms.FileField(label = 'Add Files')
    content_type  = forms.CharField(required = False, widget=forms.HiddenInput)
    object_pk     = forms.CharField(required = False, widget=forms.HiddenInput)

    def __init__(self, *args, **kwargs):
            
        target = kwargs.pop('target', None)
        allow_multiple = kwargs.pop('allow_multiple', True)

        initial = {}

        if target:
            initial['content_type'] = ContentType.objects.get_for_model(target).id
            initial['object_pk'] = str(target._get_pk_val())

        kwargs['initial'] = kwargs.pop('initial', {})
        kwargs['initial'].update(initial)

        super(UploadFileForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper()
        self.helper.form_action = 'media-upload'
        self.helper.layout = Layout(*self.fields.keys())

        if allow_multiple:
            self.fields['file'].widget.attrs = {'multiple' : ''}

        self.helper['file'].wrap(Field, template='media/fileinput.html')
        

    def handle_files(self):
        for f in self.files.getlist('file'):
            contenttype = ContentType.objects.get_for_id(self.cleaned_data['content_type'])
            links = contenttype.get_object_for_this_type(pk = self.cleaned_data['object_pk'])

            Media.objects.create_from_file(f, links = links)



    