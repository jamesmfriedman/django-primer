Django Primer
-------------
Primer is a WebDK built on Django, jQuery, Bootsrap and LESS, meant to kickstart your next web app.<br/>

Primer is currently still in developement and hasn't been submitted the Python Package Index yet. You can start using it now by cloning this repo or installing it directly via pip. You can <a href="http://eepurl.com/vMcH5" target="_blank">join the mailing list</a> if you would like updates on Primer's further development, or you can just watch the repo.


Installation
------------
<b>Before you begin:</b> This article assumes you have a blank Django project started up with the appropriately configured database, however you should NOT run <code>./manage.py syncdb</code> until after getting Primer setup. You can follow <a href="https://docs.djangoproject.com/en/dev/intro/tutorial01/" target="_blank">Django's tutorial</a> all the way until it tells you to sync your database.<br/>

<p>You can install Primer using your favorite Python package manager. Primer has quite a few dependencies, so if you're not using <a href="http://pypi.python.org/pypi/virtualenv" target="_blank">virtualenv</a>, now is the time to start:</p>
<pre class="prettyprint linenums">
pip install git+git://github.com/jamesmfriedman/django-primer.git
</pre>

<p>After that, add the following to the bottom of your Django settings file.</p>

<pre class="prettyprint linenums">
# this should be the last thing in your settings file
from primer.settings import *
</pre>
	
<p>Now you can run the syncdb command, <code>./manage.py syncdb</code>. Startup your server using <code>./manage.py runserver</code> or your favorite wsgi. If everythign went 	to plan, you should greeted by a <b>Hello World</b> page.</p>