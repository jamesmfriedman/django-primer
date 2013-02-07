from django import template
from django.template import loader
from django.template.loader import render_to_string

from primer.media.forms import UploadFileForm
from primer.media.models import MediaLink

register = template.Library()

@register.simple_tag(takes_context = True)
def media_uploader(context, target = None, show_previous_files = True):

	form = UploadFileForm(target = target)
	previous_files = []

	if target and show_previous_files:
		previous_files = MediaLink.objects.get_for_object(target)

	return render_to_string('media/media_uploader.html', {
		'form' : form,
		'previous_files' : previous_files
	}, context);

