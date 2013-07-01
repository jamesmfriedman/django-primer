Push Notifications
========================================

If you've plugged in a push framework, you can set the attribute of ``push`` to True for your notification class. This will do a realtime push to any users that are currently logged in. Any additional data that you pass as part of the class ``data`` attribute will be sent along side of the ``tags`` and ``message`` attributes. If you are not using a push framework, the Django messages framework will be used BUT the message will only be delivered if it is going to the currently logged in user (the user that instantiated the request). In this case, messages will still be stored for other users in the database (based on your storage level), but will not appear on their screens.

.. code-block:: python

    # Sample push notification
    # in this case, data gets pushed directly to primer-notifications.js
    # so we can control where it gets rendered from the server, or
    # set other additional js options
    InfoNotification(
        message = 'Push notifications are working!',
        data = {'parent': '#test-push-notifications-container'},
        push = True,
    ).send()