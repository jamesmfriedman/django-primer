/**
 * Via $.pushState
 * -----------------------------
 * $.pushState({
 * 	url: '/some/url/'
 * })
 * 
 * $.pushState has the following options
 * url : a url to load.
 * container : the container you are loading content into. A jQuery object or selector.
 * data : an object of random data to get saved by the history api.
 * title : the title of the document. You can leave this blank to keep it from changing.
 * layout : a layout get param that will get passed to the server. ?layout=foo.
 * callback : defaults to $.noop. A callback to happen after the load is complete.
 * scroll : defaults to false. Whether or not to scroll back to the top of the page on load.
 * load : whether or not you want to actually load the content, or just change the url bar
 * 
 * Via the data api.
 * -----------------------------
 * Use data attributes to automatically catch ajax links. You can set data-ajax
 * to a string that will get passed on to the server when the ajax call happens as a
 * parameter called "layout".
 * The following example would send a request to the server as /some/link/?layout=body
 * 
 * <a href="/some/link/" data-ajax="body" data-target="#content">Click Me</a>
 * 
 * You can also leave data-ajax set to an empty string, its no required
 */

!function($) {

	var currentPath = window.location.pathname + window.location.search + window.location.hash;
	var currentRequest = null;
	var hasHistorySupport = !history.emulate;

	/**
	 * Constructor
	 */
	function __init__() {

		$(document).on('click.history', 'a[data-ajax]', handleAjaxLinks);
		$(window).on('popstate', onStateChange);
	}


	/**
	 * Handles links for the data-ajax api
	 */
	function handleAjaxLinks(e) {
		e.preventDefault();
		var anchor = $(this);
		var options = {
			url : anchor.attr('href'),
			layout: anchor.data('ajax'),
		}

		if (anchor.data('target')) options['container'] = anchor.data('target');

		pushState(options);
	}


	/**
	 * Triggered from a pop state event
	 */
	function onStateChange(e) {
		var state = history.state;
		var url = window.location.pathname + window.location.search + window.location.hash;
		var title = document.title;
		
		// check to see that our path actually changed. This means a real page load
		// and not just a hash that is getting added
		if (currentPath.split('#')[0] != url.split('#')[0]) {

			//passing the data through to the beforePage trigger allows us
			//to modify it somewhere else before it comes back
			var loadData = {state: state, url: url, title: title}
			$(window).trigger('beforePageLoad', loadData);

			//reset our params incase they changed
			state = loadData.state;
			url = loadData.url;
			title = loadData.title;

			if ('container' in state) {
				var container = $(state.container);
			} else {
				var container = $('#body');
			}

			if (state.load) {
				//stop pending request if they switch pages again
				if (currentRequest) currentRequest.abort();

				// the actual page loading handler
				$.ajax({
					url : url,
					data : { layout: state.layout }, 
					beforeSend : function(xhr) {
						currentRequest = xhr;
						state.beforeSend(xhr, settings);
					},
					complete : function(jqXHR, status) {
						if (status == 'success') {
							document.title = title;
							$(window).trigger('pageLoaded');

							//lets page anchors jump to where they are supposed to
							if (window.location.hash) window.location.hash = window.location.hash
						}
					},

					success : state.success || function(data){
						
						container.html(data);
					
						if (state.scroll || (state.layout == 'app' || !state.layout)) $(window).scrollTop(0);
						
						var namespace = $('#primer-css-namespace').remove().val();
						if (namespace) {
							var htmlEl = $('html');
							htmlEl.removeClass(htmlEl.data('cssnamespace'));	
							htmlEl.addClass(namespace);
							htmlEl.data('cssnamespace', namespace);
						}
						
					}
				});

			}
		} else if (url.split('#').length > 1) {
			setTimeout(function(){
				window.location.hash = window.location.hash
			}, 1);
			
		}

		currentPath = url;
	}

	
	/**
	 * Core page handler
	 */
	function pushState(options, callback){

		var defaults = {
			url : null,
			container : null,
			data : {},
			title : document.title,
			layout : null,
			beforeSend : $.noop,
			success : false,
			callback : $.noop,
			scroll : false,
			load : true
		}

		//handle optionally passing load page just a url
		if (typeof(options) == 'string') {
			var config = $.extend({}, defaults, {url: options, callback: callback || $.noop});
		} else {
			var config = $.extend({}, defaults, options);
		}

		//return if we dont have a url
		if (!config.url) return;

		//handle callbacks from loadPage
		$(window).one('pageLoaded', config.callback);

		//if we have history support, we can use pushstate,
		//otherwise we will just redirect
		if (hasHistorySupport) {
			
			config.data['layout'] = config.layout;

			if (!config.container) {
				if (config.layout == 'app') {
					config.container = '#main';
				} else {
					config.container = '#body';
				}	
			}

			//set data for for pushState
			config.data['container'] = $(config.container).selector;
			config.data['layout'] = config.layout;
			config.data['scroll'] = config.scroll;
			config.data['load'] = config.load;

			history.pushState(config.data, config.title, config.url);
			$(window).trigger('popstate');

		} else {
			window.location = config.url;
		}
		
	};


	/***********************************************************************************
	 * Public API via jQuery
	 ***********************************************************************************/ 
	$.pushState = pushState;

	__init__();

}(jQuery);