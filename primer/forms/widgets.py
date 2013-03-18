from django.forms import HiddenInput, TextInput
from django.template.loader import render_to_string
from django.forms.util import flatatt
from django.utils.safestring import mark_safe

__all__ = (
	'PillAutoCompleteInput',
)

class PillAutoCompleteInput(HiddenInput):

	source = None
	format = None
	search = None

	def __init__(self, source = None, search = None, format = None, *args, **kwargs):
		self.source = source
		self.search = search
		self.format = format
		super(PillAutoCompleteInput, self).__init__(*args, **kwargs)


	def render(self, name, value, attrs=None):
		
		
		attrs = self.build_attrs(attrs, type=self.input_type, name=name)

		real_input = mark_safe(u'<input%s />' % flatatt(attrs))

		field_id = attrs.pop('id')
		attrs.pop('name')
		attrs['type'] = 'text'
		attrs['class'] = 'pill-auto-complete-fake-input'
		fake_input = mark_safe(u'<input%s />' % flatatt(attrs))
		
		return render_to_string('forms/pill_auto_complete_input.html', {
			'real_input' : real_input,
			'fake_input' : fake_input,
			'source' : self.source,
			'format' : self.format,
			'search' : self.search,
			'field_id' : field_id,
			})