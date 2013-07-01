Extension Patterns
==========================
    
Below is a visualized example of what Primer's template extension pattern seeks to provide. You can see that the main structure of your site is controlled by your **base_template**, your **app_template**, and **view_template**. The **site_template** is used mainly for adding additional site wide javascript, css, main navigation, or to override any other blocks that are present in the **base_template** or **skeleton_template**. Your **skeleton_template** is an empty barebones html skeleton for your site that has a lot of header includes, meta tags, etc.

.. raw:: html
    
    <div id="template-example" class="bs-docs-example">
        
        <button id="template-split" class="btn btn-primary">Animate</button>
        <script type="text/javascript">
            $(function(){
                $('#template-split').click(function(){
                    $("#template-example").toggleClass('split');
                });
            });
        </script>
        <div class="template-container">
            <div class="skeleton-template template-pane">
                <span class="t-label">Skeleton Template</span>
            </div>
            <div class="base-template template-pane">
                <span class="t-label">Base Template</span>
                <div class="t-header"></div>
                <div class="t-body">
                </div>
                <div class="t-footer"></div>                
            </div>
            <div class="site-template template-pane">
                <span class="t-label">Site Template</span>
            </div>
            <div class="app-template template-pane">
                <span class="t-label">App Template</span>
                <div class="t-sidebar"></div> 
                <div class="t-content"></div>
                
            </div>
            <div class="view-template template-pane">
                <span class="t-label">View Template</span>
            </div>
        </div>
        <br/><br/>
    </div>
    
Examples and Useage
-----------------------

Lets say you are making a painting app for your django site. You create the app, and you include the urls in your core urls file, making sure to specify the app name.

.. code-block:: python
    
    # in your main url conf
    url(r'^painter/', include('mysite.painter.urls', app_name = 'painter'))

Now if you have a view named ``brushes`` as part of your painting app. Primer will look for a template called ``painter/brushes.html``. This is your ``view_template``. It will also look for your ``app_template`` located at ``painter/base.html``. Your view and app templates would look something like this:

.. code-block:: django

    <!-- 
        this is an example view template for painter/brushes.html
        note that it extends your app_template
    -->
    {% extends app_template %}
    {% block view_content %}
        This is some stuff from my view {{ some_var }}
    {% endblock view_content %}

.. code-block:: django

    <!-- 
        this is an example view template for painter/base.html
        note that it extends your base_template
    -->
    {% extends base_template %}

    {% block app_content %}
        <div class="menu">
            <a href="#">Item 1</a>
            <a href="#">Item 2</a>
            <a href="#">Item 3</a>
        </div>
        <div id="view-content">
            {% block view_content %}
            {% endblock view_content %}
        </div>
    {% endblock app_content %}

Thats pretty much it for the basic example, but this pattern can be used over and over again and obviously with infinitely more complex layouts. You can additionally proved a site_template that will inject some stuff into your base_template.

.. code-block:: django

    <!-- An exmample site_layout -->
    {% extends base_template %}

    {% block header_css %}
        <link rel="stylesheet" type="text/css" href="{{ STATIC_URL }}mysite/css/test.css"/>
    {% endblock header_css %}

    {% block header_scripts %}
        <script type="text/javascript" src="{{ STATIC_URL }}mysite/js/test.js"></script>
    {% endblock header_scripts %}

    {% block body_attrs %}
        data-spy="scroll" data-target=".bs-docs-sidebar" data-offset="180"
    {% endblock body_attrs %}

    {% block navbar %}
        <a class="brand" href="#">Primer</a>
        
        <ul class="nav">
            <li><a data-ajax="app" href="{% url 'feature-home' %}">Home</a></li>
            <li><a data-ajax="app" href="{% url 'feature-setup' %}">Setup</a></li>
            <li><a data-ajax="app" href="{% url 'feature-get-started' %}">Get Started</a></li>
            <li><a data-ajax="app" href="{% url 'feature-templating' %}">Templating</a></li>
            <li><a data-ajax="app" href="{% url 'feature-javascript' %}">JavaScript</a></li>
        </ul>

        <ul class="nav pull-right">
            {% notifications_widget %}
        </ul>
    {% endblock navbar %}
