from datetime import datetime, timedelta

from django import forms
from django.template.loader import render_to_string
from django.utils.html import format_html
from django.forms.util import flatatt
from django.utils.safestring import mark_safe
from django.forms.util import to_current_timezone
from django.utils.encoding import force_text

__all__ = (
    'PillAutoCompleteInput',
    'AjaxFileInput',
    'PrimerDatePickerInput',
    'PrimerDateTimeWidget',
    'PrimerTimeInput',
    'AjaxImageInput',
)

class PillAutoCompleteInput(forms.HiddenInput):

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
        attrs['class'] = 'pill-auto-complete-real-input'
        real_input = mark_safe(u'<input%s />' % flatatt(attrs))

        field_id = attrs.pop('id')
        attrs.pop('name')
        
        attrs['class'] = 'pill-auto-complete-data-input'
        data_input = mark_safe(u'<input%s />' % flatatt(attrs))

        attrs['type'] = 'text'
        attrs['class'] = 'pill-auto-complete-fake-input'
        fake_input = mark_safe(u'<input%s />' % flatatt(attrs))
        
        return render_to_string('forms/pill_auto_complete_input.html', {
            'real_input' : real_input,
            'data_input' : data_input,
            'fake_input' : fake_input,
            'source' : self.source,
            'format' : self.format,
            'search' : self.search,
            'field_id' : field_id,
            })



class AjaxFileInput(forms.MultiWidget, forms.ClearableFileInput):
    """
    A widget for uploading files via ajax
    """

    def __init__(self, attrs=None):

        fileattrs = attrs or {}
        fileattrs['class'] = fileattrs.get('class', '') + ' file-upload-field' 

        widgets = (forms.FileInput(attrs=fileattrs),
                   forms.HiddenInput(attrs=attrs))
        super(AjaxFileInput, self).__init__(widgets, attrs)

    def decompress(self, value):
        return [None, None]

class AjaxMediaInput(AjaxFileInput):
    field_class = 'file-upload-field-media'

    def __init__(self, attrs=None):
        attrs = attrs or {}
        attrs['class'] = attrs.get('class', '') + ' ' + self.field_class 
        super(AjaxMediaInput, self).__init__(attrs)

    def render(self, name, value, attrs=None):
        string = super(AjaxMediaInput, self).render(name, value, attrs)
        string += mark_safe(u'<div class="file-upload-media-container"></div>')
        return string

class AjaxImageInput(AjaxMediaInput):
    field_class = 'file-upload-field-image'

    

        

######################################################################################################
# DateTime Widgets
######################################################################################################
class PrimerDatePickerInput(forms.DateInput):
    """
    A Widget that splits datetime input into two <input type="text"> boxes.
    """

    input_type = 'hidden'
    format = '%Y-%m-%d'
    alt_format = '%a, %b %d, %Y'

    def __init__(self, attrs = None, format = None, alt_format = None):
        self.format = format or self.format
        self.alt_format = alt_format or self.alt_format

        attrs = attrs or {}
        attrs['data-datepicker'] = ''

        # I know these look reversed but our real format is the alt format for jquery
        attrs['data-altformat'] = self.convert_date_format_to_jquery(self.format)
        attrs['data-format'] = self.convert_date_format_to_jquery(self.alt_format)

        super(PrimerDatePickerInput, self).__init__(attrs, self.format)

    def render(self, name, value, attrs=None):
        widget = super(PrimerDatePickerInput, self).render(name, value, attrs)
        final_attrs = self.build_attrs(attrs, type = 'text', name=None)
        
        del final_attrs['name']
        del final_attrs['id']

        if value and value != '':
            if isinstance(value, unicode):
                value = datetime.strptime(value, self.format)
            display_date = value.strftime(self.alt_format)
            final_attrs['value'] = force_text(display_date)

        widget += format_html('<input{0} />', flatatt(final_attrs))

        return widget
    
    def convert_date_format_to_jquery(self, fmt):
        
        fmt = fmt or ''

        d = {
           '%d' : 'd',  # day of month (no leading zero)
           '%d' : 'dd', # day of month (two digit)
           '%j' : 'o',  # day of the year (no leading zeros)
           '%j' : 'oo', # day of the year (three digit)
           '%a' : 'D',  # day name short
           '%A' : 'DD', # day name long
           '%m' : 'm',  # month of year (no leading zero)
           '%m' : 'mm', # month of year (two digit)
           '%b' : 'M',  # month name short
           '%B' : 'MM', # month name long
           '%y' : 'y',  # year (two digit)
           '%Y' : 'yy', # year (four digit)
        }
        
        for key, val in d.items():
            fmt = fmt.replace(key, val)
        
        return fmt


class PrimerTimeInput(forms.Select):

    def __init__(self, attrs, format = None, choices=None):
        choices = choices or self.generate_choices()
        super(PrimerTimeInput, self).__init__(attrs, choices)

    def generate_choices(self, time_format = '%H:%M:%S', minute_fidelity = 30):
        hours = []

        start_time = datetime.now().replace(hour = 0, minute = 0, second = 0, microsecond = 0)
        end_time = start_time + timedelta(hours = 24)

        while start_time < end_time:
            formatted_time = start_time.strftime(time_format)
            time_label = start_time.strftime('%I:%M %p').lower()
            hours.append((formatted_time, time_label))
            start_time += timedelta(minutes = minute_fidelity)

        return hours


class PrimerDateTimeWidget(forms.MultiWidget):
    """
    A Widget that splits datetime input into two <input type="text"> boxes.
    """
    template = 'forms/primer_date_time_widget.html'

    def __init__(self, attrs=None, date_format=None, time_format=None):
        widgets = (PrimerDatePickerInput(attrs=attrs, format=date_format),
                   PrimerTimeInput(attrs=attrs, format=time_format))
        super(PrimerDateTimeWidget, self).__init__(widgets, attrs)

    def decompress(self, value):
        if value:
            value = to_current_timezone(value)
            return [value.date(), value.time().replace(microsecond=0)]
        return [None, None]

    def format_output(self, rendered_widgets):
        return render_to_string(self.template, {
            'date_input' : rendered_widgets[0],
            'time_input' : rendered_widgets[1],
            })        

