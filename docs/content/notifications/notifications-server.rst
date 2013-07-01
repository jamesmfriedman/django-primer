Server Side
================================

Generating from a View
--------------------------------

.. NOTE::

    **Before you begin:** The notifications framework is built on top of Django's messages framework. You can read up on it here: `Django messages framework <https://docs.djangoproject.com/en/dev/ref/contrib/messages/>`_.
    
Sending notifications from a view is pretty straightforward. Notifications generated from the server have the added benefit of being stored for later viewing in the notification center. There is a ``Notification`` base class that you can import and use as is, or extend to create your own custom notifications. There are additional sublasses you can import of ``SuccessNotification``, ``WarningNotification``, ``InfoNotification``, and ``ErrorNotification``. You can import these individually from ``primer.notifications`` or you can import *.

.. code-block:: python
    
    from primer.notifications import *

    def myview(request):
        Notification(message = 'This is a message to the user.').send()
        ...
    
Displaying in a Template
--------------------------------
    
This is handled simililarly to the Django messages framework. There is a variable called <code>notifications</code> that is available in your templates that has been set through a context processor. You can iterate over them manually, or you can use the ``{% notifications %}`` template tag. The notifications will be auto handled by the JS as long as they are children of the the ``Notifications.container`` JS class attribute which defaults to ``#notifications-container``.

.. code-block:: django
    
    {% from primer_notification_tags import notifications %}

    # automatically
    {% notifications %}

    # manually
    <div id="notifications-container">
        {% for notification in notifications %}
            {% include notification.template %}
        {% endfor %}
    </div>


Notification Class
--------------------------------

.. raw::html
    
    <table class="table table-striped table-bordered">
        <thead>
            <tr>
                <th>Attribute</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>store</td>
                <td>
                    An int dictating the storage level for the notification.
                    <ul>
                        <li><strong>0</strong>: send only. This is the default for the success, error, warning, and info classes.</li>
                        <li><strong>1</strong>: store and send. This is the default for the base <code>Notification</code> class.</li>
                        <li><strong>2</strong>: only store the notification for the notification center. The user will not get a popup on screen.</li>
                    </ul>
                </td>
            </tr>
            <tr>
                <td>users</td>
                <td>An iterable of users the notifications are going to or a single user object. If none is set, request.user will be used.</td>
            </tr>
            <tr>
                <td>sender</td>
                <td>Optional. Needs to be a user object if set. This is the person that the notification is from, i.e. "James likes your post".</td>
            </tr>
            <tr>
                <td>type</td>
                <td>An optional string type to set for the notification. This will get added to the <code>tags</code> attribute which are used to determine the css classes that get spit out onto notifications. If you are storing the notification, it will also be saved to the database.</td>
            </tr>
            <tr>
                <td>tags</td>
                <td>Optional. These function that same as Django's messages framework tags. They are used as CSS class names in the template.</td>
            </tr>
            <tr>
                <td>message</td>
                <td>The message that you are sending to the user.</td>
            </tr>
            <tr>
                <td>data</td>
                <td>Optional. A dict of arbitrary data to be passed with the notification. This will also get saved to the DB. This MUST be a dict.</td>
            </tr>
        </tbody>
    </table>

.. NOTE::

    **Note on Storage:** Notifications can only be stored for users that are logged in. Make sure the ``store`` attribute is set to 0 if you are generating notifications for anonymous users.

.. raw:: html

    <table class="table table-striped table-bordered">
        <thead>
            <tr>
                <th>Method</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>send</td>
                <td>Sends the actual notification. This method will also save the notification based on the storage method.</td>
            </tr>
            <tr>
                <td>template</td>
                <td>Selects a template to display the notification. This is useful in templates since you can do something like <code>include notification.template</code>. This will do a lookup to see if there is a template that is a lowercased underscored version of the type, else it will use the default. The default template for display is located in <code>notifications/display/default.html</code></td>
            </tr>
            <tr>
                <td>get_target</td>
                <td>Optional. You can implement this method in your subclasses. It must return a url string that will be stored with the notifcation, and will be the location a user gets taken to if they click on the notification.</td>
            </tr>
        </tbody>
    </table>

Notification Models
-------------------------------
    
primer.notifications.models.NotificationStore
###################################################
    
.. raw:: html

    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Attribute</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>message</td>
                <td>The message for the user.</td>
            </tr>
            <tr>
                <td>followers</td>
                <td>M2M to UserNotification.</td>
            </tr>
            <tr>
                <td>sender</td>
                <td>The user who this notification is from.</td>
            </tr>
            <tr>
                <td>target</td>
                <td>Url location for the notification.</td>
            </tr>
            <tr>
                <td>data</td>
                <td>A pickled data field for the notification.</td>
            </tr>
            <tr>
                <td>type</td>
                <td>Arbitrary string type.</td>
            </tr>
        <tbody>
    </table>

primer.notifications.models.UserNotification
#######################################################

.. raw:: html

    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Attribute</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>user</td>
                <td>Link to the user.</td>
            </tr>
            <tr>
                <td>notification</td>
                <td>Link to the notification.</td>
            </tr>
            <tr>
                <td>read</td>
                <td>Boolean. Whether or not the notification has been read.</td>
            </tr>
        <tbody>
    </table>

Customization
------------------------------------------
    
You can subclass the ``Notification`` class to create easily resusable notifications with defaults. You can set any class level attributes you want as defaults in your subclass. Custom templates can be used for both the popup dislay, and notification center display. The popup display templates should be located in **notifications/display/\*** and templates for the notification center and the archive should be in **notifications/view/\***. There is a template method on the ``Notification`` class and ``NotificationStore`` model that will do a lookup based on the type before falling back to the default templates. The lookup is based on ``type`` attribute that has been set and will lowercase and underscore the name. For example, 'MyAwesomeNotification' or 'my-awesome-notification' would do a lookup for **notifications/display/my_awesome_notification.html**.

.. code-block:: python

    class MyCustomNotification(Notification):
        # set some defaults
        store = 0
        message = 'We can set a default message if we want'
        type = 'cool-notification'

    def my_view(request):
        MyCustomNotification().send()