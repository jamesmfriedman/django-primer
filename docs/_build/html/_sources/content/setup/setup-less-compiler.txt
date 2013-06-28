LESS Compiler
----------------------------

If you're not using a CSS preprocessor, you're missing out. Primer comes with automated LESS compiling which will rebuild your css every time a .less file is saved. It does this through the command line lessc compiler. You can read more about LESS at `<http://lesscss.org>`_.

Setup
``````````````````````````````

You'll need to install Node.js on your machine. You can get the lateset build from `<http://nodejs.org/>`_. Once it's installed, the easiest way to install LESS is through the Node Package Manager via your command line:

.. code-block:: bash
    $ npm install -g less
    
Now, in your settings file, you need to define the less input file and the corresponding css output file. These paths should be file system paths that start at your applications root. You can define multiple paths if necessary. I tend to just have one main less file that imports all the others. The output will be compressed and minified.

.. code-block:: python
    
    LESS_CSS_PATHS = {
        'static/less/my_site_base.less' : 'static/css/my_site_base.css'
    }

    
For a full list of LESS settings, see <a href="#settings-list" data-ajax="app">settings</a>.

Useage
`````````````````````````

The LESS processor gets activated by middleware, so to turn it on, you'll have to hit at least one url on your site for the middleware to run. Once that is done all you have to do is save a LESS file. You should then see the coressponding CSS file generated at the location you provided.