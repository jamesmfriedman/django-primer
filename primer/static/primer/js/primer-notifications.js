/*******************************************************************
 * Notifications
 * a class for generating toast popup messages (like growl)

 Example Useage:
 Notifications.error('There was a problem with your notification')
 Notifications.success('Testing')
 *******************************************************************/
var Notifications = function() {

	var containerSelector;
	var api = {};
	api.container;
	api.timer = 7000;


	/**
	 * constructor for toast, on DOM ready
	 */
	function __init__() {
		api.container = $('#notifications-container');
		containerSelector = api.container.selector;
		
		//listen for a message from the pushclient to generate a new message
		if (typeof PushClient !== 'undefined') {
			PushClient.bind('notification.new-notification', function(e, data){
				api.create(data);
			});	
		}

		handleExisting();

		//listen in for primer history page loads
		$(window).on('ajaxPageLoaded', function(){
			api.container = $(containerSelector);
			handleExisting();
		});

		$('body').on('click', '.notification[data-href]', function(e){
			window.location = $(this).data('href');
		});
	}
	

	/**
	 * Handle notifications present on pageload
	 */
	function handleExisting() {
		api.container.children().each(function(){
			new NotificationsMessage({
				existing : $(this)
			});
		});
	}

	function createNotificationFromType(type, message, parent) {
		api.create({
			message : message,
			tags : 'alert-' + type,
			parent: parent ? parent : api.container
		});
	}

	/*******************************************************************
	 * Public Methods and Attributes
	 *******************************************************************/

	/**
	 * creates a new notification
	 */
	api.create = function(options, template) {
		return new NotificationsMessage(options, template);
	};


	/**
	 * Shorthand for info notifications
	 */
	api.info = function(message, parent) {
		createNotificationFromType('info', message, parent)
	};

	/**
	 * Shorthand for warning notifications
	 */
	api.warning = function(message, parent) {
		createNotificationFromType('warning', message, parent)
	};

	/**
	 * Shorthand for error notifications
	 */
	api.error = function(message, parent) {
		createNotificationFromType('error', message, parent)
	};

	/**
	 * Shorthand for success notifications
	 */
	api.success = function(message, parent) {	
		createNotificationFromType('success', message, parent)
	};	


	/**
	 * A public templates object
	 */
	api.templates = {
		'default' : '<div class="notification alert {{ tags }}"><a class="close">×</a><strong>{{ title }}</strong>{{ message }}</div>'
	};


	/*******************************************************************
	 * Notifications Message Class
	 * represents the actual instance of the message that gets created
	 *******************************************************************/
	var NotificationsMessage = function(options, template) {
		
		var self = this;
		self.message;

		//defaults for notifications messages
		var settings = {
			'template' : 'default',
			'tags' : '',
			'title': '',
			'message' : 'This is a sample message',
			'timer' : Notifications.timer,
			'existing' : false,
			'persist' : false,
			'parent' : Notifications.container
		};

		/**
		 * Constructor for Notifications Message
		 */
		function __init__() {

			//check to see if options is just a string
			if (typeof(options) =='string') {
				options = {
					message: options
				};
				if (template) {
					options.template = template;
				}
			}

			//extend our options into our settings
			var config = $.extend(settings, options);
			
			if (config.existing) {
				//handle existing messages
				self.message = config.existing;
			} else {
				//pick out the appropriate template and render the message
				var template = Notifications.templates[config.template] ? Notifications.templates[config.template] : Notifications.templates['default'];
				template = Hogan.compile(template);
				self.message = $(template.render(config));
				
				//prepend the message to the notifications container
				$(config.parent).prepend(self.message);	
			}

			//animate it in
			self.message.addClass('fade');
			setTimeout(function(){
				self.message.addClass('in');
			}, 10);

			//set the timer for the message to be removed if persist is false
			if (!config.persist) {
				setTimeout(function(){
					self.close();
				}, config.timer);	
			}

			//bind the close btn
			self.message.find('.close').click(function(e){
				e.preventDefault();
				self.close();
			});

			//return the rendered message
			return self.message;
		}

		return __init__();
	};

	/**
	 * Close a toast message
	 */
	NotificationsMessage.prototype.close = function() {
		var self = this;
		
		setTimeout(function(){
			self.message.css({
				paddingTop: 0,
				paddingBottom: 0,
				maxHeight: 0,
				overflow: 'hidden',
				margin:0,
				opacity:0
			});
			
		},10);
		
		setTimeout(function(){
			self.message.remove();	
		}, 300);
	};


	//run our init function on DOM ready
	$(__init__);

	return api;
}();





