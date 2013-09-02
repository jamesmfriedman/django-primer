import re
import time

from django import forms
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import ungettext, ugettext, ugettext_lazy as _
from django.utils.encoding import force_unicode
from django.utils import timezone
from django.core.urlresolvers import reverse
from django.forms.util import ErrorDict
from django.utils.crypto import salted_hmac, constant_time_compare
from django.utils.encoding import force_text
from django.utils.text import get_text_list
from django.db.models.loading import get_model

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout
from crispy_forms.bootstrap import InlineRadios

COMMENT_MAX_LENGTH = getattr(settings,'COMMENT_MAX_LENGTH', 3000)
comments_content_type = None

#storage for our comment forms
primer_comment_forms = {}

#################################################################################################################
# Register and get Functions
#################################################################################################################
def register_comment_form(FormClass):
    """
    Registers a comment form
    """
    if primer_comment_forms.get(FormClass.__name__):
        raise Exception('A comment form with the classname %s has already been registered' % FormClass.__name__)

    primer_comment_forms[FormClass.__name__] = FormClass

    return FormClass


def get_comment_form(form_class_name):
    """
    Gets a comment form class out of primer_comment_forms
    """
    CommentForm = primer_comment_forms.get(form_class_name)
    if not CommentForm:
        raise Exception('A comment form with the classname %s has NOT been registered' % form_class_name)

    return CommentForm
    

class CommentSecurityForm(forms.Form):
    """
    Handles the security aspects (anti-spoofing) for comment forms.
    """
    content_type  = forms.CharField(widget=forms.HiddenInput)
    object_pk     = forms.CharField(widget=forms.HiddenInput)
    timestamp     = forms.IntegerField(widget=forms.HiddenInput)
    security_hash = forms.CharField(min_length=40, max_length=40, widget=forms.HiddenInput)

    def __init__(self, target_object, data=None, initial=None):
        self.target_object = target_object
        if initial is None:
            initial = {}
        initial.update(self.generate_security_data())
        super(CommentSecurityForm, self).__init__(data=data, initial=initial)

    def security_errors(self):
        """Return just those errors associated with security"""
        errors = ErrorDict()
        for f in ["honeypot", "timestamp", "security_hash"]:
            if f in self.errors:
                errors[f] = self.errors[f]
        return errors

    def clean_security_hash(self):
        """Check the security hash."""
        security_hash_dict = {
            'content_type' : self.data.get("content_type", ""),
            'object_pk' : self.data.get("object_pk", ""),
            'timestamp' : self.data.get("timestamp", ""),
        }
        expected_hash = self.generate_security_hash(**security_hash_dict)
        actual_hash = self.cleaned_data["security_hash"]
        if not constant_time_compare(expected_hash, actual_hash):
            raise forms.ValidationError("Security hash check failed.")
        return actual_hash

    def clean_timestamp(self):
        """Make sure the timestamp isn't too far (> 2 hours) in the past."""
        ts = self.cleaned_data["timestamp"]
        if time.time() - ts > (2 * 60 * 60):
            raise forms.ValidationError("Timestamp check failed")
        return ts

    def generate_security_data(self):
        """Generate a dict of security data for "initial" data."""
        timestamp = int(time.time())
        security_dict =   {
            'content_type'  : str(self.target_object._meta),
            'object_pk'     : str(self.target_object._get_pk_val()),
            'timestamp'     : str(timestamp),
            'security_hash' : self.initial_security_hash(timestamp),
        }
        return security_dict

    def initial_security_hash(self, timestamp):
        """
        Generate the initial security hash from self.content_object
        and a (unix) timestamp.
        """

        initial_security_dict = {
            'content_type' : str(self.target_object._meta),
            'object_pk' : str(self.target_object._get_pk_val()),
            'timestamp' : str(timestamp),
          }
        return self.generate_security_hash(**initial_security_dict)

    def generate_security_hash(self, content_type, object_pk, timestamp):
        """
        Generate a HMAC security hash from the provided info.
        """
        info = (content_type, object_pk, timestamp)
        key_salt = "django.contrib.forms.CommentSecurityForm"
        value = "-".join(info)
        return salted_hmac(key_salt, value).hexdigest()

class CommentDetailsForm(CommentSecurityForm):
    """
    Handles the specific details of the comment (name, comment, etc.).
    """
    comment       = forms.CharField(label=_('Comment'), widget=forms.Textarea,
                                    max_length=COMMENT_MAX_LENGTH)

    def get_comment_object(self):
        """
        Return a new (unsaved) comment object based on the information in this
        form. Assumes that the form is already validated and will throw a
        ValueError if not.

        Does not set any of the fields that would come from a Request object
        (i.e. ``user`` or ``ip_address``).
        """
        if not self.is_valid():
            raise ValueError("get_comment_object may only be called on valid forms")

        CommentModel = self.get_comment_model()
        new = CommentModel(**self.get_comment_create_data())
        new = self.check_for_duplicate_comment(new)

        return new

    def get_comment_model(self):
        """
        Get the comment model to create with this form. Subclasses in custom
        comment apps should override this, get_comment_create_data, and perhaps
        check_for_duplicate_comment to provide custom comment models.
        """
        return get_model('primer_comments', 'Comment')

    def get_comment_create_data(self):
        """
        Returns the dict of data to be used to create a comment. Subclasses in
        custom comment apps that override get_comment_model can override this
        method to add extra fields onto a custom comment model.
        """
        return dict(
            content_type = ContentType.objects.get_for_model(self.target_object),
            object_pk    = force_text(self.target_object._get_pk_val()),
            comment      = self.cleaned_data["comment"],
            submit_date  = timezone.now(),
            site_id      = settings.SITE_ID,
            is_public    = True,
            is_removed   = False,
        )

    def check_for_duplicate_comment(self, new):
        """
        Check that a submitted comment isn't a duplicate. This might be caused
        by someone posting a comment twice. If it is a dup, silently return the *previous* comment.

        This was a changed a bit from the default django one to allow duplicate comments to be posted
        after 1 minute has passed, instead of an entire day...
        """
        possible_duplicates = self.get_comment_model()._default_manager.using(
            self.target_object._state.db
        ).filter(
            content_type = new.content_type,
            object_pk = new.object_pk,
            user = new.user
        )
        for old in possible_duplicates:
            
            if (new.submit_date -  old.submit_date).total_seconds() < 60 and old.comment == new.comment:
                return old

        return new

    def clean_comment(self):
        """
        If COMMENTS_ALLOW_PROFANITIES is False, check that the comment doesn't
        contain anything in PROFANITIES_LIST.
        """
        comment = self.cleaned_data["comment"]
        if settings.COMMENTS_ALLOW_PROFANITIES == False:
            bad_words = [w for w in settings.PROFANITIES_LIST if w in comment.lower()]
            if bad_words:
                raise forms.ValidationError(ungettext(
                    "Watch your mouth! The word %s is not allowed here.",
                    "Watch your mouth! The words %s are not allowed here.",
                    len(bad_words)) % get_text_list(
                        ['"%s%s%s"' % (i[0], '-'*(len(i)-2), i[-1])
                         for i in bad_words], ugettext('and')))
        return comment

class CommentForm(CommentDetailsForm):
    honeypot      = forms.CharField(required=False,
                                    label=_('If you enter anything in this field '\
                                            'your comment will be treated as spam'))

    def clean_honeypot(self):
        """Check that nothing's been entered into the honeypot."""
        value = self.cleaned_data["honeypot"]
        if value:
            raise forms.ValidationError(self.fields["honeypot"].label)
        return value

#################################################################################################################
# Base Comment Form
#################################################################################################################
@register_comment_form
class PrimerCommentForm(CommentForm):
    """
    Base Primer Comment Form
    This removes the garbage fields we dont need but keeps everything else from
    our Django Comment Form
    """

    form_title = 'Comment'
    submit_label = 'Submit'
    comment_type = None

    comment = forms.CharField(
        label = _('Comment'), 
        widget = forms.Textarea(
            attrs = {
                'placeholder' : 'Write Something...',
                # 'class' : 'autogrow'
            },
        ),
        max_length = COMMENT_MAX_LENGTH,
    )

    formclass = forms.CharField(widget = forms.HiddenInput())
    comments_type = forms.CharField(widget = forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        
        # get the comments_comment_type and cache it for future use
        global comments_content_type
        if not comments_content_type:
            Comment = get_model('primer_comments', 'Comment')
            comments_content_type = ContentType.objects.get_for_model(Comment)

        # little hackery. The comment for we are sublassing does not
        # let us pass arbitrary kwargs, so we have to remove our extra
        # comment types arg
        comments_type = kwargs.get('comments_type')
        if comments_type:
            del kwargs['comments_type']
        else:
            comments_type = 'comments'
        
        super(PrimerCommentForm, self).__init__(*args, **kwargs)
    
        # set our formclass field
        self.fields['formclass'].initial = self.__class__.__name__
        self.fields['comments_type'].initial = comments_type

        self.helper = FormHelper()
        
        if self.submit_label:
            self.helper.add_input(Submit('submit', self.submit_label))
        
        self.helper.form_class = '%s comment-form-%s %s' % ('comment-form', self._get_form_classname(), 'clearfix')
        self.helper.form_method = 'post'
        self.helper.form_action = reverse('comments-post')
        
        # set a crispy_forms layout object we can manipulate in our subclasses
        # passing all the fields as arguments for defaults
        self.helper.layout = Layout(*self.fields.keys())


    def get_comment_create_data(self):
        """
        Returns the dict of data to be used to create a comment. Subclasses in
        custom comment apps that override get_comment_model can override this
        method to add extra fields onto a custom comment model.
        """

        # get a copy of our data, and remove all the fields that are backed in
        data = self.cleaned_data.copy()
        remove_list = ['comment', 'name', 'url', 'timestamp', 'object_pk', 'security_hash', 'content_type', 'honeypot', 'email', 'formclass', 'comments_type']
        for key in remove_list:
            try:
                del data[key]
            except KeyError:
                pass
        if not len(data.keys()):
            data = None

        return dict(
            content_type = ContentType.objects.get_for_model(self.target_object),
            object_pk    = force_unicode(self.target_object._get_pk_val()),
            comment      = self.cleaned_data['comment'],
            submit_date  = timezone.now(),
            site_id      = settings.SITE_ID,
            is_public    = True,
            is_removed   = False,
            type         = self._get_type_as_string(),
            data         = data
        )


    def _get_form_classname(self):
        """
        Gets a css classname for the form, based on the type
        """
        return self._get_type_as_string().replace('_', '-')

    
    def _get_type_as_string(self):
        """
        Gets the type name for the comments. It first looks to see if the
        comment_type attribute is set on the class. If not, it falls back
        to using an underscored version of the classname, with the word
        form removed from the end
        """
        if self.comment_type:
            return self.comment_type
        else:
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', self.__class__.__name__)
            return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower().rstrip('_form')


    def get_class_name(self):
        """
        For templates that cant access builtins
        """
        return self.__class__.__name__


#################################################################################################################
# Some Baked in Custom Forms
#################################################################################################################
@register_comment_form
class CommentForm(PrimerCommentForm):

    submit_label = 'Comment'

    def __init__(self, *args, **kwargs):
        super(CommentForm, self).__init__(*args, **kwargs)
        

@register_comment_form
class StatusForm(PrimerCommentForm):

    form_title = 'Status'
    submit_label = 'Update Status'

    def __init__(self, *args, **kwargs):

        super(StatusForm, self).__init__(*args, **kwargs)

        self.fields['comment'].widget.attrs['placeholder'] = 'Update your status...'


@register_comment_form
class TimelineForm(PrimerCommentForm):

    form_title = 'Timeline'
    submit_label = 'Update'

    def __init__(self, *args, **kwargs):

        super(TimelineForm, self).__init__(*args, **kwargs)
        self.fields['comment'].widget.attrs['placeholder'] = 'What\'s happening?...'



@register_comment_form
class EmotionForm(PrimerCommentForm):

    form_title = 'Emotion'
    submit_label = 'Update Emotion'

    emotion = forms.ChoiceField(
        label = 'How are you feeling today?',
        widget = forms.RadioSelect(),
        choices = (
            ('happy', 'Happy'),
            ('sad', 'Sad'),
            ('indifferent', 'Indifferent'),
            ('coy', 'Coy'),
            ('loving', 'Loving'),
            ('angry', 'Angry')
        )
    )

    def __init__(self, *args, **kwargs):

        super(EmotionForm, self).__init__(*args, **kwargs)
        
    
        self.fields['comment'].label = 'Describe Why'
    
        keys = self.fields.keys()
        keys.append(keys.pop(keys.index('comment')))
        self.helper.layout = Layout(*keys)

        self.helper['emotion'].wrap(InlineRadios)



