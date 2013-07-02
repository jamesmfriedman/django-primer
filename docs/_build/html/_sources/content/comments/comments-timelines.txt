Timelines
===================

Timelines are a different take on walls. They are functionally identical, just represented differently visually.

.. code-block:: django

	{% load timeline from primer_comment_tags  %}
	{% timeline target=comment_obj position="center" %}