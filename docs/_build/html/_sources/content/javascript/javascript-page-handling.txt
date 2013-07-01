Page Handling
====================================================

It is very popular to "ajaxify" your entire site. Primer provides an easy integrated way to do this with browsers that support the history api. It is also integrated with the backend to provide you with the ability to load certain sections of the page. With a little setup, you can have an entire site that works with both ajax and standard page loads. Imagine an app, but with deep links.

.. NOTE::

    **Bonus:** Using the page handler will also swap out the css namespace located on the html element in ``primer/skeleton.html``.
    
Via Data Attributes
------------------------------------------
    
You can use ajax page handling without writing any javascript. Just add ``data-ajax=""`` to any link to automatically ajaxify your site. By default, this will load everything up to but not including your skeleton_template. Additionally you can set the attribute to a layout value which specifies what page fragment to load, such as ``data-ajax="app"``. The baked in layouts are 'app', 'view', 'section'. You can optionally set ``data-target`` to a css selector of what container to load the content into. You can read more on Primer's template patterns in the Templating section.

.. code-block:: html
    
    <a href="/primer/notifications" data-ajax="" data-target="#container">Ajax Link</a>


Public Methods
------------------------------------------
.. raw:: html
    
    <table class="table table-striped table-bordered">
        <tbody>
            <tr>
                <td>$.pushState(options|url, callback)</td>
                <td>
                    $.pushState can either be used by just passing options, or alternatively by passing a url and a callback.
                    Options is an object with the following keys:
                    <ul>
                        <li><strong>url:</strong> The url you are loading. Required.</li>
                        <li><strong>data:</strong> Arbitrary data object to get passed to history.pushState. Defaults to empty object.</li>
                        <li><strong>title:</strong> Title for pushState. Defaults to document.title.</li>
                        <li><strong>container:</strong> The DOM element you are loading page into. Default is '#body'. This can be either a selector or a jQuery element.</li>
                        <li><strong>layout:</strong> This option is used by the backend to decide which page fragment to load. Default is null.</li>
                        <li><strong>callback:</strong> A callback that gets triggered after the page is loaded. Default is $.noop.</li>
                        <li><strong>scroll:</strong> Whether or not to set the pages scroll top back to 0. Default is false, gets set to true if layout is 'app' or null.</li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>