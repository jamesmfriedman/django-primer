!function($){

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
				var req = $.ajax(config);
				req.done(function(data, textstatus, jqXHR){
					form.trigger('ajaxSubmitSuccess', [data, textstatus, jqXHR]);
				});
			}

			//init the form
			init();
		});

		return this;
	};

	$(function(){
		$('body').on('focus', 'form.ajax-submit', function(e){
			$(this).ajaxSubmit();
		});
	});

}(jQuery);
	