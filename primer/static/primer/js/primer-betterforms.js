var BetterForms = function($){
	
	var api = {};
	
	/**
	 * Replaces a select box with a bootstrap button dropdown
	 * @param options.classes string classes to add to the dropdown button
	 */
	$.fn.bootstrapSelectReplace = function(options) {

		this.each(function(){

			var settings = {
				classes : null, //adds classes to the button toggle
				id : null 		//adds an ID to the button group
			};

			var config = $.extend({}, settings, options);
			var select = $(this);
			var btn = $('' +
				'<div class="btn-group">' +
					'<a class="btn dropdown-toggle" data-toggle="dropdown">' +
						'<span class="btn-label"></span> ' +
						'<span class="caret"></span>' +
					'</a>' +
					'<ul class="dropdown-menu">' +
					'</ul>' +
				'</div>');

			var itemTemplate = '<li><a href="#"></a></li>';
			var dividerTemplate = '<li class="divider"></li>';
			var dropdown = btn.find('.dropdown-menu');
			var classes = config.classes || '';


			/**
			 * bootstrapSelectReplace Constructor
			 */
			function __init__() {
				
				//place our button 				
				select.before(btn);

				//build our dropdown menu options from our select
				select.find('option').each(function(){
					var option = $(this);
					var value = option.attr('value');

					//special case, catch dividers
					if (value == 'divider') {
						var item = $(dividerTemplate);

					} else {
						var item = $(itemTemplate);
						var itemAnchor = item.find('a');
						itemAnchor.text(option.text());
						itemAnchor.attr('data-value', value);	
					}

					//append the item to the list
					dropdown.append(item);

				});

				//add our classes to our button
				btn.find('.dropdown-toggle').addClass(classes);

				//add an id if we have one
				if (config.id) {
					btn.attr('id', config.id);
				}

				//hide our select
				select.hide();

				//bind handlers
				select.on('change', updateButton);
				btn.on('click', '.dropdown-menu a', itemHandler);
				
				//update our button to get our most recent selection
				updateButton();
			}


			/**
			 * Sets the label for our bootstrap button
			 */
			function updateButton() {
				btn.find('.btn-label').text(getCurrentLabel);
			}


			/**
			 * Handles dropdown menu items
			 */
			function itemHandler(e) {
				e.preventDefault();
				select.val($(this).data('value'));
				select.change();
				updateButton();
			}


			/**
			 * Gets the current label from the select
			 */
			function getCurrentLabel() {
				return select.find('option[value="'+ select.val() +'"]').text();
			}


			__init__();
		});

		return this;
	}


	/**
	 * Auto setup datepickers. These are created by Pimers PrimerDateInput widgets in Python.
	 */
	$.fn.setupDatepicker = function(options) {

		var displayInput = $(this);

		// escape out if its been setup already
		if (displayInput.data('datepicker')) return;
		displayInput.data('datepicker', true);

		var settings = {
			altField : displayInput.prev(),
			altFormat: displayInput.data('altformat'),
			dateFormat: displayInput.data('format')
		};

		//extend the options into the settings
		var config = $.extend({}, settings, options);

		//create the datepicker
		displayInput.datepicker(config);

		return displayInput;	
	};


	/**
	 * This init runs on dom ready
	 */
	function __init__() {

		//auto init datepickers
		$(document.body).on('focus', '[data-datepicker]', function(){
			$(this).setupDatepicker();
		});
	};


	// fire the on dom ready
	$(__init__);
	
	// return the public interface
	return api;
}(jQuery);