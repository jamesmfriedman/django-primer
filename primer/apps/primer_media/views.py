import uuid
import os

from django.views.generic import View
from django.core.files import File
from django.conf import settings

from primer.shortcuts import render_to_json
from .signals import files_uploaded

class UploadView(View):
    
    def post(self, request):    

        return_paths = []
        filelist = []
        
        for key, f in request.FILES.items():
            f = File(f)
            base_filename, extension = os.path.splitext(f.name)
            filename = str(uuid.uuid4()) + extension
            pathname = '%s/%s' % (settings.FILE_UPLOAD_TEMP_DIR, filename)
            filelist.append(pathname)
            
            with open(pathname, 'w') as fw:
                fw.write(f.read())
            
            return_paths.append(filename)
            
            # dispatch a signal so we can do some deferred processing of our media
            files_uploaded.send(sender=self, filelist=filelist)
        
        return render_to_json(request, return_paths)