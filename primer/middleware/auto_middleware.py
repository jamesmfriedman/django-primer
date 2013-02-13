from django.conf import settings
from django.core.urlresolvers import resolve
from django.template.loader import select_template, TemplateDoesNotExist
from django.contrib.sites.models import get_current_site


__all__ = [
    'AutoMiddleware'
    ]


class AutoMiddleware():
    """
    Does some automagic handling of stuff for views and templates
    """

    def process_view(self, request, view_func, view_args, view_kwargs):

        # create our primer dict on the request object
        request.primer = {}
        resolver_match = resolve(request.path)

        # our view and app name
        view_name = resolver_match.func.__name__
        app_name = resolver_match.app_name or 'page'
        current_site = get_current_site(request)

        self.get_template_paths(request, view_name, app_name, current_site)
        self.get_css_namespace(request, view_name, app_name)


    def get_css_namespace(self, request, view_name, app_name):
        
        app_namespace = 'app-' + app_name
        view_namespace = 'view-' + view_name

        request.primer['css_namespace'] = '%s %s' % (app_namespace, view_namespace)


    def get_template_paths(self, request, view_name, app_name, current_site):
        """
        build out template paths
        we fallback as much as possible so we dont require 
        a certain template structure

        adds the paths directly to request.primer
        """
        
        layout = request.REQUEST.get('layout')
    
        # Skeleton Templates ############################################
        skeleton_templates = [
            'skeleton.html',
            'primer/skeleton.html'
        ]

        if request.is_ajax(): 
            skeleton_templates.insert(0, 'primer/ajax.html')

            if layout:
                skeleton_templates.insert(0, 'primer/ajax_%s.html' % layout)

        skeleton_template = select_template(skeleton_templates).name


        # Base templates ############################################
        base_templates = [
            'base.html',
            'primer/base.html'
        ]

        if view_name == 'login': 
            base_templates.insert(0, 'registration/login.html')            
        
        base_template = select_template(base_templates).name


        # Site Templates ############################################
        site_templates = [
            '%s/site.html' % current_site.name,
            'site.html',
            base_template
        ]

        site_template = select_template(site_templates).name


        # App Templates ############################################
        app_templates = [
            '%s/base.html' % app_name,
            base_template
        ]

        
        app_template = select_template(app_templates).name


        # View Templates ############################################
        view_templates = [
            '%s/%s.html' % (app_name, view_name),
            '%s.html' % (view_name)
        ]

        view_template = view_templates
        
        request.primer['skeleton_template'] = skeleton_template
        request.primer['site_template']     = site_template
        request.primer['base_template']     = base_template
        request.primer['app_template']      = app_template
        request.primer['view_template']     = view_template


    
        

    
        

    
