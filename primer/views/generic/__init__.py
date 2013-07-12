import re

from django.views.generic import View
from django.contrib.sites.models import get_current_site
from django.core.urlresolvers import resolve
from django.template.loader import select_template
from django.core.exceptions import ImproperlyConfigured, PermissionDenied
from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.views import redirect_to_login

from primer.shortcuts import render_to_template, render_to_json, render_to_xml, render_to_debug


class LoginRequiredMixin(object):
    """
    Taken from django-braces
    View mixin which verifies that the user is authenticated.

    NOTE:
        This should be the left-most mixin of a view
    """
    login_url = settings.LOGIN_URL  # LOGIN_URL from project settings
    raise_exception = False  # Default whether to raise an exception to none
    redirect_field_name = REDIRECT_FIELD_NAME  # Set by django.contrib.auth

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            if self.raise_exception:
                raise PermissionDenied  # return a forbidden response
            else:
                return redirect_to_login(request.get_full_path(),
                    self.get_login_url(), self.get_redirect_field_name())

        return super(LoginRequiredMixin, self).dispatch(request, *args,
            **kwargs)

    def get_login_url(self):
        """
        Override this method to customize the login_url.
        """
        if self.login_url is None:
            raise ImproperlyConfigured("%(cls)s is missing the login_url. "
                "Define %(cls)s.login_url or override "
                "%(cls)s.get_login_url()." % {"cls": self.__class__.__name__})

        return self.login_url

    def get_redirect_field_name(self):
        """
        Override this method to customize the redirect_field_name.
        """
        if self.redirect_field_name is None:
            raise ImproperlyConfigured("%(cls)s is missing the "
                "redirect_field_name. Define %(cls)s.redirect_field_name or "
                "override %(cls)s.get_redirect_field_name()." % {
                "cls": self.__class__.__name__})

        return self.redirect_field_name


class PrimerView(View):
    """
    Base primer view. Provides the majority of the automagic view handling present in Primer.
    """
    site = None
    request = None
    app_name = None
    view_name = None

    def dispatch(self, request, *args, **kwargs):
        """
        Dispatch handler
        """
        self._setup(request)
        return super(PrimerView, self).dispatch(request, *args, **kwargs)

    def to_template(self, data={}, view_template=None, context_instance=None, content_type=None, status=None):
        """
        Proxy for render_to_template
        """
        return render_to_template(self.request, data, view_template, context_instance, content_type, status)

    def to_json(self, data={}, status=200):
        """
        Proxy for render_to_json
        """
        return render_to_json(self.request, data, status)

    def to_xml(self, data={}, status=200):
        """
        Proxy for render_to_xml
        """
        return render_to_xml(self.request, data, status)

    def to_debug(self, data={}):
        """
        Proxy for render_to_debug
        """
        return render_to_debug(self.request, data)

    def _setup(self, request):
        """
        A setup function for subclasses shoudl call in dispatch
        if dispatch gets overriden.
        """
        if not hasattr(request, 'primer'):
            request.primer = {}
            
        self._build_view_name()
        self.request = request
        self.current_site = get_current_site(request)
        self.app_name = resolve(request.path).app_name
        self._build_css_namespace()
        self._build_template_paths()

    def _build_view_name(self):
        """
        Builds a view name out of the classname. For transitional purposes
        The classname is being lowercased and underscored
        """
        view_name = view_name = self.__class__.__name__
        pos = view_name.rfind('View')
        view_name = view_name[:pos] + view_name[pos+4:]
        view_name = re.sub('(.)([A-Z]{1})', r'\1_\2', view_name).lower()
        self.view_name = view_name

    def _build_css_namespace(self):
        """
        Builds the CSS namespace and adds it to the request.primer dict
        This gets injected in templates via a context processor
        """
        css_page_namespace = 'view-%s' % self.view_name.replace('_', '-')
        css_app_namespace = 'app-%s' % self.app_name
        self.request.primer['css_namespace'] = '%s %s' % (
            css_page_namespace, css_app_namespace)

    def _build_template_paths(self):
        """
        Gets the template paths for a stack of templates
        and places them in the request.primer dict
        """
        layout = self.request.REQUEST.get('layout')

        # Skeleton Templates ############################################
        skeleton_templates = [
            'skeleton.html',
            'primer/skeleton.html'
        ]

        if self.request.is_ajax(): 
            skeleton_templates.insert(0, 'primer/ajax.html')

            if layout:
                skeleton_templates.insert(0, 'primer/ajax_%s.html' % layout)

        skeleton_template = select_template(skeleton_templates).name


        # Base templates ############################################
        base_templates = [
            'base.html',
            'primer/base.html'
        ]

        if self.view_name == 'login': 
            base_templates.insert(0, 'primer/login.html')            
        
        base_template = select_template(base_templates).name


        # Site Templates ############################################
        site_templates = [
            '%s/site.html' % self.current_site.name,
            'site.html',
            base_template
        ]

        site_template = select_template(site_templates).name


        # App Templates ############################################
        app_templates = [
            '%s/base.html' % self.app_name,
            site_template
        ]

        
        app_template = select_template(app_templates).name


        # View Templates ############################################
        view_templates = [
            '%s/%s.html' % (self.app_name, self.view_name),
            '%s.html' % (self.view_name)
        ]

        if self.view_name == 'login': 
            view_templates.insert(0, 'registration/login.html')

        view_template = view_templates
        
        self.request.primer['skeleton_template'] = skeleton_template
        self.request.primer['site_template']     = site_template
        self.request.primer['base_template']     = base_template
        self.request.primer['app_template']      = app_template
        self.request.primer['view_template']     = view_template
