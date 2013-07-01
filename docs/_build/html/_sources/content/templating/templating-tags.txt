Template Tags
===================

.. raw:: html

    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Template Tags</th>
                <th>Arugments</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{% include_raw 'mytemplate.html' %}</td>
                <td>The template you want to include, as string.</td>
                <td>This will include a whole template without running it through Django's templating engine. This is useful if you need to include something like a set of JavaScript templates that would usually be parsed because it shares a similar syntax.</td>
            </tr>
            <tr>
                <td>{% verbatim %}</td>
                <td>None</td>
                <td>This is a clone of Django 1.5 verbatim tag for use in older version of Django. It stops parsing a template until it hits an "endverbatim" tag.</td>
            <tr/>
            <tr>
                <td>{% build_url_params dict %}</td>
                <td>A dictionary of params.</td>
                <td>This takes a python dictionary and collapses it into a a string of url params including the "?".</td>
            </tr>
        </tbody>
    </table>

.. code-block:: django
    
    {% load build_url_params from primer_tags %}
    <a href="http://google.com{% build_url_params mydict %}">Google Search</a>
