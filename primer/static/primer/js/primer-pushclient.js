var PushClient = function() {

    var api = $({});
    var pushData = $('meta[push-service]');
    var channel = pushData.attr('channel');
    var pubKey = pushData.attr('pub-key');
    var serviceInstance = null;


    $(function(){
        if (channel != '') api.subscribe(channel);
    });

    api.receiveMessage = function(message){
        var event = message.event ? message.event : 'push-event';
        api.trigger(event, [ message]);
    };

    /************************************************************************************
     * Public
     ************************************************************************************/
    
    /**
     * Subscribe to a channel
     * NOTE: Pubnub won't subscribe to a channel twice,
     * so we don't have to check for duplicate channels.
     */
    api.subscribe = function(channel_id) {
        //console.log('subscribing:', channel_id);
        if (typeof PUBNUB !== 'undefined') {
            PUBNUB.subscribe({ 
                channel: channel_id, 
                callback: api.receiveMessage 
            });
        }

        if (typeof Pusher !== 'undefined') {
            serviceInstance = new Pusher(pubKey);
            var channel = serviceInstance.subscribe(channel_id);
            channel.bind_all(function(event, data){
                data = data || {}

                if (!('event' in data)) {
                    data['event'] = event;
                }    
                
                api.receiveMessage(data);
            });
        }
    };
    
    /**
     * Unsubscribe from a channel
     * NOTE: Pubnub silently ignores requests to unsub
     * from channels that were never subscribed to.
     */
    api.unsubscribe = function(channel_id) {
        if (typeof PUBNUB !== 'undefined') {
            //console.log('unsubscribing:', channel_id);
            PUBNUB.unsubscribe({
                channel: channel_id
            });
        }

        if (typeof Pusher !== 'undefined') {
            serviceInstance.disconnect();
        }
    };

    return api;
}();