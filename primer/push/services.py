import importlib
from datetime import datetime
from django.dispatch import Signal
from django.conf import settings

from primer.utils import get_request

# our push service that we import to other modules
PushService = None

# a signal that will broadcast messages received in python
message_received = Signal(providing_args=['message'])


####################################################################################################
# Push Service Wrapper
####################################################################################################
class PushServiceWrapper(object):
    """
    This is a wrapping class for implementing your own push service. You should override the Private
    members _send_data and _receive data in your subclasses
    """

    # some general attributes that most push services share in common
    # these get set by attrs in settings.PUSH_SERVICE_SETTINGS
    app_id = None
    pub_key = None
    sub_key = None
    secret_key = None
    use_ssl = False

    # class attribute to store the actual api that is being used
    api = None

    def __init__(self, *args, **kwargs):
        self.app_id = settings.PUSH_SERVICE_SETTINGS.get('app_id')
        self.pub_key = settings.PUSH_SERVICE_SETTINGS.get('pub_key') 
        self.sub_key = settings.PUSH_SERVICE_SETTINGS.get('sub_key')
        self.secret_key = settings.PUSH_SERVICE_SETTINGS.get('secret_key')
        self.use_ssl = settings.PUSH_SERVICE_SETTINGS.get('use_ssl', False)
        


    def get_channels_for_user(self, user):
        """
        Accepts a single user object and returns their
        randomized channel names that are stored int their sessions
        """
        request = get_request()
        
        # get the sessions for authenticated users. We have patched a user onto the sessions table
        if user is not request.user or request.user.is_authenticated():
            sessions = user.sessions.filter(expire_date__gt = datetime.now())
            print 'SESSSIONs', sessions
            return [ session.get_decoded().get('push_channel_id') for session in sessions if session.get_decoded().get('push_channel_id') ]
        
        # our user is not authenticated which means it must be the current logged in user
        elif user == request.user:
            return [ request.session.get('push_channel_id') ]
        
        

    def send(self, event = 'push-event', channels = None, users = None, data = {}): 
        """
        Send a push notification
        This function does all the prep work and will make a call
        to _send_data which should be overwritten by the subclasses

        Arguments
            event: the name of the event JavaScript will receive
            channels: Either a single channel, an iterable of channels, or None if you are passing users
            users: Either a single user, an iterable of users, or None if you are passing channels
            data: the actual data that we want to send through the push service
        """
        # catch not having channels or users
        if not channels and not users:
            raise Exception('You must pass either users or channels to send a push notification.')

        # normalize both the channels and users data and make them iterables if they're not
        # this is because we are allowed to pass a single user or users or single channel and channels
        if channels and not hasattr(channels, '__iter__'): channels = [channels]
        elif users and not hasattr(users, '__iter__'): users = [users]
            
        # add the event to the data
        data['event'] = event

        if users:
            channels = []
            for user in users:
                channels += self.get_channels_for_user(user)

        for channel in channels:
            self._send_data(channel, data)


    def subscribe(self, channel):
        """
        Method that implements how to subscribe to data
        """
        print 'Subclass must implement its own subscribe method'


    def _receive(self, message):
        """
        A receive method you can optionally use that will broadcast a signal.
        Useful if your subscribe function takes a callback
        """
        message_received.send(sender = self, message = message)


    def _send_data(self, channel, data):
        """
        Private method that actually sends out the data
        This should be overwritten by a subclass that implements how the API actually sends the data
        """
        print 'Subclass must implement its own _send_data method'


    


####################################################################################################
# PubNub Push Service Declaration
####################################################################################################
if settings.PUSH_SERVICE == 'pubnub':
    
    from pubnub.Pubnub import Pubnub
    
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


    PushService = PubNubService()


####################################################################################################
# Pusher Push Service Declaration
####################################################################################################
if settings.PUSH_SERVICE == 'pusher':
    
    from pusher import Pusher
    
    class PusherService(PushServiceWrapper):

        def __init__(self, *args, **kwargs):
            super(PusherService, self).__init__()
            
            self.api = Pusher(
                app_id = self.app_id, 
                key = self.pub_key, 
                secret = self.secret_key
            )


        def _send_data(self, channel, data):
            self.api[channel].trigger('push-event', data)


    PushService = PusherService()


####################################################################################################
# Here we try to import a custom push notifications class
####################################################################################################
if not PushService and settings.PUSH_SERVICE:
    
    try:
        module_name = '.'.join(settings.PUSH_SERVICE.split('.')[:-1])
        classname = settings.PUSH_SERVICE.split('.').pop()
        
        module = importlib.import_module(module_name)
        Service = getattr(module, classname)
        PushService = Service()
    except (ImportError, AttributeError):
        print 'Failed to load custom push service'
    

