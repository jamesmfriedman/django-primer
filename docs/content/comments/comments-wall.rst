Walls
===================

Walls are similar to comment lists except they offer the ability to reply to the main posts. Walls are intended to be highly customizeable and allow for custom forms and control over the comments rendering through the use of custom templates. Implementation is identical to that of comment lists.

.. code-block:: django

	{% load wall from primer_comment_tags  %}
	{% wall target=comment_obj forms="StatusForm, EmotionForm" %}