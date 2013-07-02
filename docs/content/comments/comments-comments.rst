Basic Comment List
=============================

Getting a comments list on a page with primer is extremely easy. Load the <code>primer_comment_tags</code> template tag library, and pass an object from the database in as your target. The form will be added for you automatically, and it is an extension of Django's built in comment form, so it contains all the nifty little security features as well as checking for profanity, duplicates, etc.

.. NOTE::

	**Heads Up!** The fields for name and email will appear if the user isn't authenticated.

.. code-block:: django		
	
	{% load comments from primer_comment_tags %}
	{% comments target=my_object %}
