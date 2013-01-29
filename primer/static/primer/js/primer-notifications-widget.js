(function($){
	
	$.fn.notificationWidget = function() {

		this.each(function(){

			var $this = $(this);
			var href = $this.attr('href');
			var dropdown = $this.closest('.dropdown').find('.notifications-widget-dropdown-container');
			var badge = $this.find('.badge');
			var count = badge.data('count');
			var stale = true;

			function init() {

				if ($this.data('notifications-widget')) return;
				$this.data('notifications-widget', true);

				//bind the click handler
				$this.click(function(e){
					if (stale) {
						setTimeout(function() {
							dropdown.css('max-height', dropdown.height());
							dropdown.load(href, function(){
								dropdown.css('max-height', '');
								dropdown.addClass('loaded');
								dropdown.removeClass('loading');
								initNotifications();
							});	
						},1);
					}
				});
				
				//bind to the push client
				if (typeof PushClient !== 'undefined') {
					//both of these events carry the count, listen for them
					PushClient.on('notification.count notification.new-notification', function(e, data){						
						if ('count' in data) updateCount(data.count);
					});
				}

				//update the notification count
				updateCount(count);
			}

			function updateCount(num) {
				
				//set the count
				count = parseInt(num);
				
				//the data in the widget is now stale
				stale = true;

				if (count) {
					$this.addClass('unread-notifications');
				} else {
					$this.removeClass('unread-notifications');
				}	

				badge.text(count);
			}

			function initNotifications() {

				//the data is new, it just loaded
				stale = false;

				//loop through the notifications, perform setups
			}

			init();
		});

		return this;
	}

	$(function(){
		$('#notifications-widget-toggle').notificationWidget();
		$(window).on('pageLoaded', function(){
			$('#notifications-widget-toggle').notificationWidget();
		});
	});

})(jQuery);