from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

from models import Media
from primer.utils import get_current_user

class UploadFileForm(forms.Form):
    
    file  = forms.FileField()

    def __init__(self, *args, **kwargs):
        
        super(UploadFileForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper()
        self.helper.form_action = 'feature-media-upload'
        self.helper.add_input(Submit('submit', 'Submit'))

        self.fields['file'].widget.attrs = {'multiple' : ''}


    def handle_files(self):
        from django.contrib.auth.models import User
        for f in self.files.getlist('file'):
            Media.objects.create_from_file(f, links = User.objects.all())



    