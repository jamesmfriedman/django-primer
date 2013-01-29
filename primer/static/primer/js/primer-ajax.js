!function() {
	
	/************************************************************************************************************************************************
	 * Primer Ajax
	 * This adds a lot of auto functionality to ajax requests. It works
	 * by getting extra data via json from the server. If the extra
	 * data isnt in the return data, this passes siltently to jQueries standard ajax
	 ************************************************************************************************************************************************/

	/**
	 * global ajax setup
	 */
	$.ajaxSetup({
		cache: false
	});

	//store jQuerys ajax before we override it
	var jQueryAjax = $.ajax;

	/**
	 * Primer jQuery Ajax Override
	 */
	$.ajax = function(options) {
		
		//store the users success function
		var successFunc = 'success' in options && options.success ? options.success : $.noop;
		var errorFunc = 'error' in options && options.error ? options.error : $.noop;

		//The primer ajax config. This gets merged with the one passed into jQuery ajax
		var primer = {

			success: function(data, textStatus, jqXHR) {

				//check to see if this is a primer ajax response
				if (typeof data == 'object' && 'primer' in data) {
					
					//handle redirects
					if (data.primer.redirect) handleRedirect(data.primer.redirect);

					//handle inline redirects, or ajax page loads
					if (data.primer.redirect_inline) handleInlineRedirect(data.primer.redirect_inline);
					
					//handle status
					if (data.primer.status) handleStatus(data.primer.status);
					
					//handle messages
					var message = data.primer.message ? data.primer.message : null;
					

					//handle whether we should call the users success or error
					if (data.primer.status != 'error') {
						
						//broadcast any messages we have
						handleMessage(data.primer.status, data.primer.message);
						successFunc(data, textStatus, jqXHR);

					} else {
						
						//throw an error, note that we are adding a 4th argument, which is our data
						//jQuery only uses the first 3
						primer.error(jqXHR, textStatus, message, data);
					}
						
				} 

				//this wasnt a primer ajax request, just call the users success function
				else {
					successFunc(data, textStatus, jqXHR);
				}
			},

			error: function(jqXHR, textStatus, errorThrown, data) {

				if (data) {
					//check to see if we should do some form processing
					if ('form' in data.primer) {
						var formData = data.primer.form;
						var form = null;

						//TODO, csrf tokens are the same across multiple forms per page, create a unique_id for all forms
						if (formData.csrf_token) {
							//there might be multiple of this on the same page, if theres only one, look no further
							var csrfForm = $('input[name=csrfmiddlewaretoken][value="'+ formData.csrf_token +'"]').closest('form');
							if (csrfForm.length === 1) {
								form = csrfForm;
							}
						}

						// fallback in case a form wasnt found
						if (!form) {

							//gather up the fields they came back, we can see if any forms have
							//a field with that name and value
							var selectors = [];
							for (field in formData.fields) {
								selectors.push('[name="'+ field + '"][value="'+ formData.fields[field] +'"]');
							}

							//loop through our selectors. :has() returns mutliple matches, so loop
							//through until we find one that is unique to our form
							for (var i = 0; i < selectors.length; i++) {
								if ($('form:has(' + selectors[i] + ')').length == 1) {
									form = $('form:has(' + selectors[i] + ')');
									break;
								} 
							}
							
							//if a form STILL hasnt been found, pick the first one that matches
							//honestly, this shouldnt really happen unless there is the same
							//form multiple times on the same page
							if (!form) form = $('form:has(' + selectors.join(',') + ')').first()
						}

						//we finally have a form to work with...
						//process errors
						for (field in formData.errors) {
							handleFormFieldError(form, field, formData.errors[field]);
						}

						//if there is an error message, send it out
						if (formData.error_message) {
							handleMessage('error', formData.error_message, form);
						}

						//trigger tooltips
						form.find('[name]').tooltip({
							placement:'bottom'
						});
					}

					//handle a users error message
					handleMessage(data.primer.status, data.primer.message);
				}
				
				//trigger the original error function
				errorFunc(jqXHR, textStatus, errorThrown, data)
			}

		};


		/**
		 * Handle redirects from Primer
		 */
		function handleRedirect(url) {
			window.location = url;
		}

		/**
		 * Handle inline redirects from Primer, or ajax page loads
		 */
		function handleInlineRedirect(url) {
			$.loadFragment(url);
		}


		/**
		 * Handle the status from Primer
		 */
		function handleStatus(status) {

		}


		/**
		 * Handle the message from Primer
		 */
		function handleMessage(status, message, parent) {
			if (Notifications && message) {
				Notifications[status](message, parent);
			}
		}

		/**
		 * Takes care of a form field with an error
		 */
		function handleFormFieldError(form, field, error) {
			//get the form field and the nearest control group
			var formField = form.find('[name="'+ field +'"]');
			var controlGroup = formField.closest('.control-group');
			var timeout;

			//add these data attributes for tooltips
			formField.attr('rel', 'tooltip');
			formField.attr('data-original-title', error);
			
			//highlight our field as an error
			controlGroup.addClass('error');

			//clears all of our errors
			var clearFieldErrors = function() {
				formField.unbind('keypress.ajaxFieldError');
				clearTimeout(timeout);

				//remove the tooltip
				formField.tooltip('hide');
				formField.removeAttr('rel');
				formField.removeAttr('data-original-title');
				
				//remove the error class
				controlGroup.removeClass('error');
			};

			//Handle removing the error, which happens after the first keypress or a few minutes
			formField.on('keypress.ajaxFieldError', clearFieldErrors);
			timeout = setTimeout(clearFieldErrors, 180000);
		}


		options = $.extend({}, options, primer);

		return jQueryAjax(options);
	};

	/************************************************************************************************************************************************
	 * AjaxSubmit
	 * Easily ajax submit forms
	 ************************************************************************************************************************************************/
	$.fn.ajaxSubmit = function(options){

		this.each(function(){
			

			var form = $(this);
			var onComplete = $.noop;
			var submitBtns = form.find('[type=submit]');
			var settings = {
				type: 'POST'
			};

			/**
			 * Init for an ajax form
			 */
			function init() {
				if (form.data('ajax-submit')) return;
				form.data('ajax-submit', true);

				//options might be null, at least make it a new object
				options = options ? options : {};

				//bind the handler
				form.submit(onSubmit)

				//we wrap the passed in oncomplete,
				//so we can auto disable buttons
				if ('complete' in options) {
					onComplete = options.complete;
					delete options.complete;
				}

				options.form = form;

				settings.complete = function() {
					submitBtns.removeAttr('disabled');
				};

				if ('now' in options && !!options.now) onSubmit();

			}


			/**
			 * The on submit for a form
			 */
			function onSubmit(e) {
				if (e) e.preventDefault();

				//merge in the settings and the ajax submit defaults
				var config = $.extend({}, settings, options);
				
				//serialize our form data	
				config.data = form.serialize();

				//if a url wasn't explicitly passed, use the forms action
				config.url = !config.url ? form.attr('action') : config.url;

				//disable any submit buttons to prevent doubleclicks
				submitBtns.attr('disabled', true);

				//ajax it up
				$.ajax(config);
			}

			//init the form
			init();
		});

		return this;
	};

	/************************************************************************************************************************************************
	 * Ajax Content
	 * Ajax content provides an easy way to load content after page load
	 * this is done by putting in a placeholder span with an attribute of data-ajax-content
	 * which points to the url where the data comes from. The placeholder span will be
	 * replaced with the loaded content
	 ************************************************************************************************************************************************/
	 $(function(){

	 	$('[data-ajax-content]').each(function(){
	 		var placeholder = $(this);
	 		var url = placeholder.data('ajax-content');
	 		$.get(url, function(data){
	 			if (typeof data == 'object' && 'primer' in data) {
	 				html = data.primer.html;
	 			} else {
	 				html = data;
	 			}
	 			placeholder.replaceWith(html)
	 		});
	 	});
	 });

}(jQuery);








