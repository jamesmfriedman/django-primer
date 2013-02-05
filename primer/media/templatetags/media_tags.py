from django import template
from django.template import loader
from django.template.loader import render_to_string

from primer.media.forms import UploadFileForm

register = template.Library()

@register.simple_tag(takes_context = True)
def media_uploader(context, target = None):

	form = UploadFileForm(target = target)

	return render_to_string('media/media_uploader.html', {
		'form' : form
	}, context);

