Setup
---------------------------
    
For Pusher or PubNub, setup only takes a few seconds. Note, you'll have to register at the appropriate site and get your own credentials.

.. code-block:: python

    # located in your main settings file
    # note that this should be AFTER you have imported primers
    # settings if you have used the primer.settings object

    # this can be 'pubnub', 'pusher', or a full module path for a
    # custom class. i.e. myapp.push.MyPushService
    PUSH_SERVICE = 'pubnub' 

    # these are a list of all possible keys
    # you only need to add the ones your push framework requres
    # for pusher, their key is pub_key
    PUSH_SERVICE_SETTINGS = {
        'app_id' : 'my-app-id',
        'pub_key' : '0987654321',
        'sub_key' : '1234567890',
        'secret_key' : 'my-secret-key',
        'use_ssl' : False
    }

.. ATTENTION::
    **ALL DONE!** Seriously, that was it. Now just read how to use it.