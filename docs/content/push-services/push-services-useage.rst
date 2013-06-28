Server Side Useage
---------------------------
    
Anywhere you want to use your push service, you just have to import ``primer.push.services.PushService``. ``PushService`` has the following methods:

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
                <td>send(event, channels, users, data)</td>
                <td>
                    Sends data through your push service backend. You have to set either channels or users, but not both.
                    <ul>
                        <li><strong>event</strong>: a string event name that the client side will receive and respond to, such as 'notification.new-notification'.</li>
                        <li><strong>channels</strong>: an iterable of channel_ids to broadcast to. This will get autopopulated by the users channels if users are present.</li>
                        <li><strong>users</strong>: an iterable of user objects or a single user. Their channel_ids will be looked up from their sessions.</li>
                        <li><strong>data</strong>: the actual data you want to send. Should be a dict that is JSON encodeable by json.dumps.</li>
                    </ul>
                </td>
            </tr>
            <tr>
                <td>subscribe(channel)</td>
                <td>This method can be implemented by the PushService class you are using if you want the server to be able to receive push events as well. When data is received, it will broadcast the <code>message_received</code> signal located in <code>primer.push.services</code></td>
            </tr>
        </tbody>
    </table>

.. code-block:: python

    # example of how to push data to the current logged in user in a view
    from primer.push.services import PushService

    def myview(request):
        PushService.send(
            event = 'my-new-event',
            users = request.user,
            data = {
                'foo' : 'bar',
                'test' : 'case'
            }
        )
        ...

    
Client Side Useage
---------------------------

If you are using Pubnub or Pusher, you're all set. The appropriate scripts and setup information is included. There is a global js class for you to access called ``PushClient``. This class broadcasts events whenver it receives a new notification from the server, so you can listen for specific events and react accordingly.

.. code-block:: javascript
    
    //somehwere in your js
    //the first argument is the event name you passed from the server side
    PushClient.bind('my-event-name', function(data){
        //do whatever you want with the data here. This is the
        //data that came back from the server
    });


Integrating a Custom PushService
----------------------------------
    
If PubNub or Pusher don't do it for you, you can always implement your own push service. There is a class for you to extend located in ``primer.push.services`` called ``PushServiceWrapper``. At a minimum, you need to perform your api setup in **__init__** and implement your own custom **_send_data** method. The following class attributes are available to you:
  
- app_id: the app_id from PUSH_SERVER_SETTINGS
- pub_key: the pub_key from PUSH_SERVER_SETTINGS
- sub_key: the sub_key from PUSH_SERVER_SETTINGS
- secret_key: the secret_key from PUSH_SERVER_SETTINGS
- use_ssl: use_ssl from PUSH_SERVER_SETTINGS
- api: You should set this to an instance of your api inside the init function
    
Here is the pubnub service wrapper example. It also incorporates its own subscribe method. Notice that subscribe uses **self.receive** as its callback, which is there to be a default handler for messages if you would like to use it. It broacasts the ``message_received`` signal located in ``primer.push.services``

.. code-block:: python
    
    from pubnub.Pubnub import Pubnub
    from primer.push.services import PushServiceWrapper
        
    class PubNubService(PushServiceWrapper):

        def __init__(self, *args, **kwargs):
            super(PubNubService, self).__init__()

            self.api = Pubnub(
                self.pub_key,  
                self.sub_key,
                self.secret_key,
                self.use_ssl
            )

        def subscribe(self, channel):
            self.api.subscribe({
                'channel'  : channel,
                'callback' : self.receive 
            })

        def _send_data(self, channel, data):
            self.api.publish({
                'channel' : channel,
                'message' : data
            })


In your settings.py file, you'll need to set PUSH_SERVER to a string pointing to your class. In the above example, it would be something like ``myapp.push.services.PubNubService``

On the Client Side
````````````````````````````

You'll have to include the necessary javascript, but you can still use ``PushClient`` to do your handling. Override the following methods in ``PushClient`` to handle your push service accordingly.

.. raw:: html

    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Method</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>PushClient.subscribe(channel_id)</td>
                <td>This method subscribes to channels for the user. Your function must also take channel_id.</td>
            </tr>
            <tr>
                <td>PushClient.unsubscribe(channel_id)</td>
                <td>This method unsubscribes from a channel or disconnects.</td>
            </tr>
        </tbody>
    </table>


.. code-block:: javascript

    //example, override anywhere in your JS
    PushClient.subscribe = function(channel_id) {
        //do some custom processing with your
        //make sure in the end, you pass any data you receive
        //to PushClient.receiveMessage(data)

        MyCustomFrameWork.subscribe(channel);
        MyCustomFramework.onReceveData(function(data){
            PushClient.receiveMessage(data);
        })
    }