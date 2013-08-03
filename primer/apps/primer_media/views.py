import uuid
import os

from django.views.generic import View
from django.core.files import File
from django.conf import settings

from primer.shortcuts import render_to_json

class UploadView(View):
    
    def post(self, request):    

        return_paths = []

        for key, f in request.FILES.items():
            f = File(f)
            base_filename, extension = os.path.splitext(f.name)
            filename = str(uuid.uuid4()) + extension
            pathname = '%s/%s' % (settings.FILE_UPLOAD_TEMP_DIR, filename)
            
            with open(pathname, 'w') as fw:
                fw.write(f.read())
            
            return_paths.append(filename)

        return render_to_json(request, return_paths)