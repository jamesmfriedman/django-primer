:tocdepth: 2

Notifications
****************************************

The notifications framework is a top to bottom solution for notifying your users with toast / growl style pop up messages as well as storing them for later viewing in a notifications center. The notifications frawemework leverages Django's builtin messages framework for cookie based notifications as well as generating notifications from the client. It also bakes in Pusher.com and PubNub for plug and play push notifications to your app.

.. include:: notifications-client.rst
.. include:: notifications-server.rst
.. include:: notifications-push.rst