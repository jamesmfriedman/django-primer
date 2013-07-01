Auto-Rendering
=====================

I'll admit it, I'm a lazy developer and I get annoyed by repetition. Django harps on DRY, so I never understood why I have to type render_to_response over and over and over again in my code when I can have middleware hooks that run before and after my view function, especially when I am almost alway returning a rendered template or JSON.

This is where auto-rendering comes in to play which is handled by ``primer.middleware.RenderMiddlware`` and ``primer.middleware.AutoMiddleware``. This picks template based off of the app_name (this set when you include urls from an app), as well as the actual name of the view function. Auto-rendering will do the following for you:

- Pick a template named the same as your current view function.
- Choose the template location based on the current app as you have it defined in your root URL conf.
- Will return a json response of the data from the return dict if no template is found.
- It only requires you to return a dict from your views.
- If your view's response is not a dict, then ``RenderMiddleware`` will leave it alone.

Example
----------------------------------

.. code-block:: python

    # in your main url conf, including urls from one of your apps
    url(r'^awesomeapp/', include('mysite.awesomeapp.urls', app_name = 'awesomeapp'))


Note that we game our app a name. This is a standard Django convention. At this point, somewhere in your app you will have defined your own custom urls and views. Lets say you have a view named "foo".

.. code-block:: python
    
    # a view inside of awesome app
    def foo(request):
        x = 5
        return {
            'x' : x
        }

The above example will render a view template that exists with following paths. If neither exist, it will return a json response with the "x":</p>

- awesomeapp/foo.html
- foo.html
    
If you are unhappy with the path that was automatically picked, or your template lives in a different location, you can always explicitly specify what template you want to use by passing "template" into your return dict.

.. code-block:: python
    
    # a view inside of awesome app, with a custom template
    def foo(request):
        x = 5
        return {
            'x' : x,
            'template' : 'somefolder/new_template.html'
        }


App Directories Loader
-------------------------------------
    
.. WARNING::
    **WARNING:** The following change to Django's App Directories loader might affect your Django App. The direction of the directory lookups has been reversed. Please Read.

Django's app metaphor coupled with its app directories template loader makes template organization significantly cleaner, as it allows you to store the templates directly in the app they belong to. The main issue comes down to including apps that might augment, modify, or outright monkey patch apps that have been included before them. Primer is a living example of this, attaching itself onto Django's framework. The main issue is the direction of Django's app directories lookup.

Consider this. You have an app that extends some part of Django's framework. You have templates in your path that are supposed to override the ones Django provides. Your app has to come after Django's in your installed apps because the code gets executed and imported top to bottom, and your app contains some python additions. However, if you are relying solely on the Django's app_directories loader, Django will pick its template over yours since it does the lookup in the order of your installed apps and stops at the first template found. Reversing this allows for much more natural overrides. If you've included Primer's settings as described in setup, you don't have to do anything else.