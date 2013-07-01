Overview
==============

I've heard plenty of devs say that Django's templating system wasn't powerful enough. I'd say quite the opposite, and that at times it might be too powerful. Primer seeks to add some convention to Django's templating system, and if used properly, can lead to some really DRY templating. It might seem like a lot at first, but I promise it pays off.

My biggest qualm from day one with Django's templating system is that it doesn't force you, or help you create any meaningful pattern to how templates are named or where they or stored. I inherited a two year old project where multiple devs had used different naming schemes and directory structures. Untangling that knot was a logistical nightmare. Primer takes the guess work out of naming your templates, and will also render them for you.


.. NOTE::
	**Heads Up!** The majority of this stuff is suggestion. You can use Primer and still come up with your own template and rendering scheme. This is just here to make your life easier.