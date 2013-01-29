import re

from django import forms
from django.conf import settings
from django.contrib.comments.forms import CommentForm as DjangoCommentForm
from django.contrib.comments.models import Comment
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import ungettext, ugettext, ugettext_lazy as _
from django.utils.encoding import force_unicode
from django.utils import timezone
from django.core.urlresolvers import reverse

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout, Field
from crispy_forms.bootstrap import InlineRadios

from primer.utils import get_request

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
    

#################################################################################################################
# Base Comment Form
#################################################################################################################
@register_comment_form
class PrimerCommentForm(DjangoCommentForm):
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
                'class' : 'autogrow'
            },
        ),
        max_length = COMMENT_MAX_LENGTH,
    )

    formclass = forms.CharField(widget = forms.HiddenInput())
    comments_type = forms.CharField(widget = forms.HiddenInput())
    parent = forms.CharField(widget = forms.HiddenInput(), required = False)

    def __init__(self, *args, **kwargs):
        
        # get the comments_comment_type and cache it for future use
        global comments_content_type
        if not comments_content_type:
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

    
        # set the parent on the class
        if ContentType.objects.get_for_model(self.target_object) == comments_content_type:
            self.fields['parent'].initial = self.target_object.pk
            

        self.fields['name'].widget = forms.HiddenInput()
        self.fields['name'].required = False
        self.fields['email'].widget = forms.HiddenInput()
        self.fields['email'].required = False
        self.fields['url'].widget = forms.HiddenInput()
        self.fields['url'].required = False

        # set our formclass field
        self.fields['formclass'].initial = self.__class__.__name__
        self.fields['comments_type'].initial = comments_type

        # reorder our fields, backwards...
        self.fields.insert(0, 'email', self.fields.pop('email'))
        self.fields.insert(0, 'name', self.fields.pop('name'))
        self.fields.insert(0, 'comment', self.fields.pop('comment'))

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
        remove_list = ['comment', 'name', 'url', 'timestamp', 'object_pk', 'security_hash', 'content_type', 'honeypot', 'email', 'formclass', 'parent', 'comments_type']
        for key in remove_list:
            del data[key]
        if not len(data.keys()):
            data = None

        parent = None
        if self.cleaned_data['parent']:
            try:
                parent = Comment.objects.get(pk = self.cleaned_data['parent'])
            except Comment.DoesNotExist:
                    pass

        return dict(
            content_type = ContentType.objects.get_for_model(self.target_object),
            object_pk    = force_unicode(self.target_object._get_pk_val()),
            user_name    = self.cleaned_data['name'],
            user_email   = self.cleaned_data['email'],
            user_url     = self.cleaned_data['url'],
            comment      = self.cleaned_data['comment'],
            submit_date  = timezone.now(),
            site_id      = settings.SITE_ID,
            is_public    = True,
            is_removed   = False,
            type         = self._get_type_as_string(),
            parent       = parent,
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
            user_name = new.user_name,
            user_email = new.user_email,
            user_url = new.user_url,
        )
        for old in possible_duplicates:
            
            if (new.submit_date -  old.submit_date).total_seconds() < 60 and old.comment == new.comment:
                return old

        return new


#################################################################################################################
# Some Baked in Custom Forms
#################################################################################################################
@register_comment_form
class CommentForm(PrimerCommentForm):

    submit_label = 'Comment'

    def __init__(self, *args, **kwargs):
        super(CommentForm, self).__init__(*args, **kwargs)

        # so, we hid it in our default form, but we want to support
        # non authenticated comments lists, so re-show the fields
        request = get_request()
        if not request.user.is_authenticated():
            self.fields['name'].widget = forms.TextInput(attrs = {'placeholder' : 'Name'})
            self.fields['name'].required = True
            self.fields['email'].widget = forms.TextInput(attrs = {'placeholder' : 'Email'})
            self.fields['email'].required = True
            

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



