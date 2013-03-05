from django.forms import HiddenInput, TextInput
from django.template.loader import render_to_string
from django.forms.util import flatatt
from django.utils.safestring import mark_safe

__all__ = (
	'PillAutoCompleteInput',
)

class PillAutoCompleteInput(TextInput):

	source = None

	def __init__(self, source = None, *args, **kwargs):
		self.source = source
		super(PillAutoCompleteInput, self).__init__(*args, **kwargs)


	def render(self, name, value, attrs=None):
		real_input = super(PillAutoCompleteInput, self).render(name, value, attrs)
		
		fake_attrs = self.build_attrs(attrs, type=self.input_type, name=name)
		fake_attrs.pop('id')
		fake_attrs.pop('name')
		fake_attrs['type'] = 'text'
		fake_attrs['class'] = 'pill-auto-complete-fake-input'
		fake_input = mark_safe(u'<input%s />' % flatatt(fake_attrs))
		
		return render_to_string('forms/pill_auto_complete_input.html', {
			'real_input' : real_input,
			'fake_input' : fake_input,
			'source' : self.source
			})