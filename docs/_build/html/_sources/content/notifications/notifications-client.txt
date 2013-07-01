Client Side
=================================

Generating from JavaScript
---------------------------------

You don't need the server to generate alerts for your users. There is a global ``Notifications`` class available in JS.

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
                <td>Notifications.create(options, template)</td>
                <td>
                    Creates a new notification. Options can be either a string or object. Template is optional an is only used if the first argument is passed as a string. The following properties are available:
                    <ul>
                        <li><strong>template:</strong> The client side template you want to use to render the message. Default is 'default'.</li>
                        <li><strong>tags:</strong> A string of css classes to append to the the notification.</li>
                        <li><strong>title:</strong> A title that gets passed into the template.</li>
                        <li><strong>message:</strong> The actual message for the notification.</li>
                        <li><strong>timer:</strong> How long the notification is displayed on screen in milliseconds. Defaults to Notifications.timer.</li>
                        <li><strong>persist:</strong> Whether or not the notification must be explicitly closed by the user.</li>
                        <li><strong>parent:</strong> The parent container for the notification. Defaults to Notifications.container.</li>
                    </ul>
                </td>
            </tr>
            <tr>
                <td>Notifications.success(message, parent)</td>
                <td>Generates a success notification. Message is what you want it to say. You can optionally set parent to a selector or jQuery object of the container you want to append the notification to. The default is <code>#notifications-container</code></td>
            </tr>
            <tr>
                <td>Notifications.info(message, parent)</td>
                <td>Same as success, generates an info notification.</td>
            </tr>
            <tr>
                <td>Notifications.warning(message, parent)</td>
                <td>Same as success, generates an warning notification.</td>
            </tr>
            <tr>
                <td>Notifications.error(message, parent)</td>
                <td>Same as success, generates an error notification.</td>
            </tr>
        </tbody>
    </table>

These public properties can be overwritten to your liking.

.. raw:: html

    <table class="table table-striped table-bordered">
        <thead>
            <tr>
                <th>Property</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Notifications.container</td>
                <td>The default container for notifications to be added to and for existing notifications to be inited.</td>
            </tr>
            <tr>
                <td>Notifications.timer</td>
                <td>The default display time, in nano seconds.</td>
            </tr>
            <tr>
                <td>Notifications.templates</td>
                <td>An object of keys pointing to templates that will get compiled by the Hogan.js templating library.</td>
            </tr>
        </tbody>
    </table>

Useage
---------------------------------

.. raw:: html

    <div class="bs-docs-example" id="client-side-demo-container">   
        <button class="btn btn-success" data-type="success">Success</button>
        <button class="btn btn-info" data-type="info">Info</button>
        <button class="btn btn-warning" data-type="warning">Warning</button>
        <button class="btn btn-danger" data-type="error">Error</button>
        <button class="btn btn-default" data-type="persistent">Persist</button>
    </div>

.. code-block:: javascript

    //Short hand
    Notifications.create('This is a notification!');
    Notifications.success('You were successful.');

    //With options
    Notifications.create({
        message : 'This is my message',
        tags : 'alert-blue info-notification myclass',
        timer: 5000
    });

.. raw:: html

    <script type="text/javascript">
    $(function(){
        var container = $('#client-side-demo-container');

        container.on('click', '.btn', function(){
            var type = $(this).data().type;
            var message = 'This is a ' + type + ' notification.';
            
            if (type == 'persistent') {
                Notifications.create({
                    persist: true,
                    message : message + ' It must be explicitly dismissed by the user.',
                    parent: container
                });
            } else {
                Notifications[type](message, container);    
            }
        });

    });
    </script>