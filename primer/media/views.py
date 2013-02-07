from django.http import HttpResponse

from forms import UploadFileForm


def upload(request):

    if request.method == 'POST':
        upload_form = UploadFileForm(request.POST, request.FILES)
        if upload_form.is_valid():
            upload_form.handle_files()


    return HttpResponse('ok')