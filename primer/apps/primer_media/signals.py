import django.dispatch

files_uploaded = django.dispatch.Signal(providing_args = ['filelist'])