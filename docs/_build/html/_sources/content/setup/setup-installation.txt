New Projects
----------------------

.. NOTE::
    **Before you begin:** This article assumes you have a blank Django project started up with the appropriately configured database, however you should NOT run ``/manage.py syncdb`` until after getting Primer setup. You can follow `Djangos tutorial <https://docs.djangoproject.com/en/dev/intro/tutorial01/>`_ all the way until it tells you to sync your database.

You can install Primer using your favorite Python package manager. Primer has quite a few dependencies, so if you're not using `virtualenv <http://pypi.python.org/pypi/virtualenv>`_, now is the time to start:

.. code-block:: python
    
    pip install git+git://github.com/jamesmfriedman/django-primer.git

After that, add the following to the bottom of your Django settings file.

.. code-block:: python

    # this should be the last thing in your settings file
    from primer.settings import *

    
Now you can run the syncdb command, ``./manage.py syncdb``. Startup your server using ``./manage.py runserver`` or your favorite wsgi. If everything went to plan, you should greeted by a **Hello World** page.

Existing Projects
----------------------
    
It is recommended that you setup Primer when starting a new project, however you can add Primer to an existing project by using South or some other library that handles migrations. If you are using South, you'll have to manually specify the paths for **auth**, **sites**, and **sessions** that your migrations will be created in, otherwise they will be added to either Django or Primer in your Python site-packages and never make it into your production environment. You can read South's documentation on specifying `SOUTH_MIGRATION_MODLUES <http://south.readthedocs.org/en/latest/settings.html#setting-south-migration-modules>`_.

.. code-block:: python
    
    # Exmample for specifying custom migrations paths for South. 
    # Replace "core.southmigrations" with where you want migrations stored in your Django project.
    SOUTH_MIGRATION_MODULES = {
        'auth': 'core.southmigrations.auth',
        'sites': 'core.southmigrations.sites',
        'sessions' : 'core.southmigrations.comments',
    }


After specifying your migration paths, you can init your migrations for those apps, and fake them. From there, follow the tutorial above for new projects, but before you run syncdb, you'll want to run ``./manage.py schemamigration myapp --auto`` for each of the modules we are migrating, replacing "myapp" with **auth**, **sites**, or **sessions** respectively. Once you are done with that, you can migrate using ``./manage.py migrate``. At this point, you should have successfully migrated Django's built in models, and you can move on to running syncdb to fill in the rest of Primer's tables in your database.
