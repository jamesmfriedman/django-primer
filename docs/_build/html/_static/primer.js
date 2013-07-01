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

	
	var jQueryAjax = $.ajax;

	$.ajax = function(options) {

		var resp = jQueryAjax(options);

		resp.fail(function(jqXHR, textStatus, errorThrown){
			var json = null;

			try {
				json = $.parseJSON(jqXHR.responseText)	
			} catch(e) {}
			
			if (json && ('_primer' in json)) {
				
				if ('form_errors' in json['_primer']) handleFormErrors(json['_primer']['form_errors']);
				
			}

		});

		return resp;
	};

	var handleFormErrors = function(formErrors) {
	
		var form = $('form');

		for (name in formErrors) {
			if (name == 'non_field_errors') continue;

			var expression = ('[name="'+ name +'"]');
			var forms = form.has(expression);
			if (forms.length == 1) {
				form = forms;
				break;
			}
		}

		for (name in formErrors) {
			if (formErrors[name].length) {
				
				if (name == 'non_field_errors') {
					form.find('.alert-form-error').remove();

					Notifications.create({
						message : formErrors[name],
						tags : 'alert-error alert-form-error',
						parent: form,
						persist : true
					});
				} else {
					var input = form.find('select[name="'+ name +'"], textarea[name="'+ name +'"], input[name="'+ name +'"]');
					input.closest('.control-group').addClass('error');
					input.siblings('.help-inline-error').remove();
					input.after($('<span class="help-inline help-inline-error">'+ formErrors[name] +'</span>'));	
				}
			}
		}

	};

	
}(jQuery);









!function($){

 /* AUTOCOMPLETE PUBLIC CLASS DEFINITION
	* ================================= */

	/**
	 * options.searchProp: a dot separated string representing the key to search for in the json return. Example, users.value, or data.results.users.name
	 */
	var Autocomplete = function (element, options) {
		this.$element = $(element);
		this.options = $.extend({}, $.fn.autocomplete.defaults, options);
		this.matcher = this.options.matcher || this.matcher;
		this.sorter = this.options.sorter || this.sorter;
		this.highlighter = this.options.highlighter || this.highlighter;
		this.onSelect = this.options.onSelect || this.onSelect;
		this.updater = this.options.updater || this.updater;
		this.$menu = $(this.options.menu).appendTo('body');
		this.source = this.options.source;
		this.shown = false;
		this.searchProp = this.options.searchProp.split('.');
		this.searchKey = this.searchProp[this.searchProp.length-1];
		this.request = null;
		this.allowDuplicates = this.options.allowDuplicates || false;
		this.selectedItems = [];
		this.requireSelection = this.options.requireSelection || false;
		this.listen();

		return this;
	}

	Autocomplete.prototype = {

		constructor: Autocomplete,

		select: function () {
			var item = this.$menu.find('.active').data('value');
			var val = item[this.searchKey];
			this.onSelect(val, item);
			this.selectedItems.push(item);
			return this.hide()
		},

		onSelect: function(val, item) {
			this.$element
				.val(this.updater(val))
				.change()
		},

		removeSelectedItem: function(item) {
			var index = this.selectedItems.indexOf(item);
			if (index > -1 ) {
				this.selectedItems.splice(index, 1);
			}
		},

		addSelectedItem: function(item) {
			this.selectedItems.push(item);
		},

		purgeSelectedItems: function() {
			this.selectedItems = []
		},

		updater: function (item) {
			return item
		},

		show: function () {
			var pos = $.extend({}, this.$element.offset(), {
				height: this.$element[0].offsetHeight
			})

			this.$menu.css({
				top: pos.top + pos.height
			, left: pos.left
			})

			this.$menu.show()
			this.shown = true
			return this
		},

		hide: function () {
			this.$menu.hide()
			this.shown = false
			return this
		},

		lookup: function (event) {
			var that = this
			var items;

			this.query = this.$element.val()

			if (!this.query) {
				return this.shown ? this.hide() : this
			}

			//this just prevents us from having too many ajax reqs, 
			//it will cancel if there was one going
			if (that.request) {
				that.request.abort();
			}

			that.request = $.get(this.source, {q: this.query}, function(results){
				
				results = that.getValuesList(results);
				
				items = $.grep(results, function (item) {
					return that.matcher(item[that.searchKey])
				});	
				
				//if there are not duplicates allowed, subract our currently selected items
				if (!that.allowDuplicates) items = items.subtract(that.selectedItems);

				items = that.sorter(items);

				if (!items.length) {
					return that.shown ? that.hide() : that
				}

				return that.render(items.slice(0, that.options.items)).show()
				
			});
		},

		getValuesList: function(results) {

			//a one dimensional list, there are no nested keys, just return the results
			if (this.searchProp.length == 1) return results;

			//here we have nested keys, separated by dots. i.e. users.name, or something.results.value
			//we will traverse to the depth right before the actual property we are searching against, which is the last key
			for(var i = 0; i < this.searchProp.length - 1; i++) {
				results = results[this.searchProp[i]];
			}

			//a catch for the key not being found, just return an empty list
			if (typeof results == 'undefined') results = [];

			return results;
		},

		matcher: function (item) {
			return ~(item.toString().toLowerCase().indexOf(this.query.toLowerCase()))
		},

		sorter: function (items) {
			var beginswith = []
				, caseSensitive = []
				, caseInsensitive = []
				, item

			while (item = items.shift()) {
				sortkey = item[this.searchKey];
				if (!sortkey.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
				else if (~sortkey.indexOf(this.query)) caseSensitive.push(item)
				else caseInsensitive.push(item)
			}

			return beginswith.concat(caseSensitive, caseInsensitive)
		},

		highlighter: function (item) {
			var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
			return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
				return '<strong>' + match + '</strong>'
			})
		},

		render: function (items) {
			var that = this

			items = $(items).map(function (i, item) {
				//this creates the actual li. 
				i = $(that.options.item).data('value', item)
				//Lets add our props as attributes so we can style it
				for (key in item) {
					i.attr('data-' + key, item[key]);
				}

				i.find('a').html(that.highlighter(item[that.searchKey]))
				return i[0]
			})

			items.first().addClass('active')
			this.$menu.html(items)
			return this
		},

		next: function (event) {
			var active = this.$menu.find('.active').removeClass('active')
				, next = active.next()

			if (!next.length) {
				next = $(this.$menu.find('li')[0])
			}

			next.addClass('active')
		},

		prev: function (event) {
			var active = this.$menu.find('.active').removeClass('active')
				, prev = active.prev()

			if (!prev.length) {
				prev = this.$menu.find('li').last()
			}

			prev.addClass('active')
		},

		listen: function () {
			this.$element
				.on('blur',     $.proxy(this.blur, this))
				.on('keypress', $.proxy(this.keypress, this))
				.on('keyup',    $.proxy(this.keyup, this))
				.on('keydown',  $.proxy(this.keydown, this))

			this.$menu
				.on('click', $.proxy(this.click, this))
				.on('mouseenter', 'li', $.proxy(this.mouseenter, this))
		},

		keydown: function (e) {
			switch(e.keyCode) {
				case 13: // enter
					if (this.requireSelection) e.preventDefault();
					break;
			}
		},

		keyup: function (e) {
			var that = this;
			switch(e.keyCode) {
				case 40: // down arrow
				case 38: // up arrow
					break

				case 9: // tab
				case 13: // enter
					if (!this.shown) return
					this.select()
					break

				case 27: // escape
					if (!this.shown) return
					this.hide()
					break

				default:
					that.lookup();
			}

			e.stopPropagation()
			e.preventDefault()
		},

		keypress: function (e) {
			if (!this.shown) return

			switch(e.keyCode) {
				case 9: // tab
				case 13: // enter
				case 27: // escape
					e.preventDefault()
					break

				case 38: // up arrow
					e.preventDefault()
					this.prev()
					break

				case 40: // down arrow
					e.preventDefault()
					this.next()
					break
			}

			e.stopPropagation()
		},

		blur: function (e) {
			var that = this
			setTimeout(function () { that.hide() }, 150)
		},

		click: function (e) {
			e.stopPropagation()
			e.preventDefault()
			this.select()
		},

		mouseenter: function (e) {
			this.$menu.find('.active').removeClass('active')
			$(e.currentTarget).addClass('active')
		}

	}


	/* AUTOCOMPLETE PLUGIN DEFINITION
	 * =========================== */

	$.fn.autocomplete = function (option) {
		var args = [].splice.call(arguments,0);

		return this.each(function () {
			var $this = $(this);
			var data = $this.data('autocomplete')
			var options = typeof option == 'object' ? option : {};
			
			//get a source attached to the dom element
			if ($this.data('src')) options.source = $this.data('src');

			if (!data) $this.data('autocomplete', (data = new Autocomplete(this, options)));
			if (typeof option == 'string') data[option].apply(data, args.slice(1));
		});
	};

	$.fn.autocomplete.defaults = {
		source: [],
		items: 8,
		menu: '<ul class="autocomplete dropdown-menu"></ul>',
		item: '<li><a href="#"></a></li>'
	}

	$.fn.autocomplete.Constructor = Autocomplete;

}(window.jQuery);
/******************************************************************************************
 * Primer Autgrow Plugin
 * by James Friedman
 *
 * A slightly different take on autogrow. We create a div that has almost all of the same
 * styles as the textarea, and add text into it. We then match the textarea
 * height to the divs height. Animation is done with a css transition.
 ******************************************************************************************/

(function($){
	
	/**
	 * Autogrow plugin
	 */
	$.fn.autoGrow = function() {

		this.each(function(){

			//quick escape for already bound instances
			if ($(this).hasClass('bound-autogrow')) return;
			
			var $this = $(this);
			var clone = $('<div/>');
			var startingHeight = $this.height();

			/**
			 * init
			 */
			function init() {
				
				//add our autogrow classes
				$this.addClass('autogrow bound-autogrow');
				
				//append the clone to the dom
				$this.before(clone);

				//math the textareas css, plus some extra stuff to hide our clone
				clone.css({
					wordWrap: 'break-word',
					position: 'absolute',
					zIndex: -1,
					borderColor: 'transparent',
					visibility: 'hidden'
				});

				//update the clone in case there is already text in our textarea
				updateClone();

				//bind handlers
				$this.on('keydown.autogrow keyup.autogrow', updateClone);
				$this.on('focus', resizeClone);
				$(window).on('resize', resizeClone);

				resizeClone();
			}


			function resizeClone() {
				clone.css({
					width: $this.width(),
					lineHeight: $this.css('line-height'),
					letterSpacing: $this.css('letter-spacing'),
					fontSize: $this.css('font-size'),
					fontFamily: $this.css('font-family'),
					
					borderTopStyle: $this.css('border-top-style'),
					borderBottomStyle: $this.css('border-bottom-style'),
					borderLeftStyle: $this.css('border-left-style'),
					borderRightStyle: $this.css('border-right-style'),
									
					borderTopWidth: $this.css('border-top-width'),
					borderBottomWidth: $this.css('border-bottom-width'),
					borderLeftWidth: $this.css('border-left-width'),
					borderRightWidth: $this.css('border-right-width'),

					paddingTop: $this.css('padding-top'),
					paddingBottom: $this.css('padding-bottom'),
					paddingLeft: $this.css('padding-left'),
					paddingRight: $this.css('padding-right')
				});
			}


			/**
			 * Update the clone when text is added to the textarea
			 */
			function updateClone() {
				
				//update the text in the clone
				//Replace carriage returns with a slug
				//we will use $.text to safe escape our html
				var val = $this.val();				
				val = val.replace(/\n/g, '---NEWLINE---');
				clone.text(val);

				//now that it is escaped, we can replace our new lines
				//with brs and safely set our content as HTML
				val = clone.text();
				val = val.replace(/---NEWLINE---/g, '<br/>');

				// add a non breaking space so we are always a little ahead
				val += '&nbsp;&nbsp;';
				clone.html(val);

				
				//if there is no text, remove the height style attr
				//if the height is smaller than starting, reset the height
				if (!val || clone.height() < startingHeight) {
					$this.css('height', '');
				}

				else if ($this.height() != clone.height()) {
					$this.height(clone.height());
				}
			}

			init();
		});

		return this;
	}


	/**
	 * Autoinit textareas with class autogrow
	 */
	$(function(){
		$('body').on('focus.autogrow', 'textarea.autogrow', function(){
			$(this).autoGrow();
		});

		$('textarea.autogrow').autoGrow();
	});

	

})(jQuery);
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
		if (displayInput.hasClass('bound')) return;

		var settings = {
			altField : 'input[data-displayfield='+ displayInput.attr('data-datefield') +']',
			altFormat: api.ALT_DATE_FORMAT,
			dateFormat: api.DATE_FORMAT
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
		$(document.body).on('focus', '.widget-date-input', function(){
			$(this).setupDatepicker();
		});
	};


	/*******************************************************************************************
	 * The public interface
	 ******************************************************************************************/
	// a jquery date format for datepickers
	api.DATE_FORMAT = 'm/d/yy';

	//the alternate format for the hidden field
	api.ALT_DATE_FORMAT = 'yy-mm-dd';


	// fire the on dom ready
	$(__init__);
	
	// return the public interface
	return api;
}(jQuery);
/**
 * Primer Collapse
 * This is intended to fix unwanted behavior in the Bootstrap Collapse plugin
 * Bootstrap collapse only assigns a class of collapsed on an items toggle
 * when the toggle is specifically clicked. This makes sure the toggle gets
 * The class when it is collapsed.
 */
$(function () {
	$('body').on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
		
  		var $this = $(this), href
    		, target = $this.attr('data-target')
      		|| e.preventDefault()
      		|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    		, option = $(target).data('collapse') ? 'toggle' : $this.data();
  		
  		$target = $(target);
  		
  		if($target.hasClass('in')) {
  			$target.closest('.accordion-group')
	  			.siblings()
	  			.find('.accordion-toggle')
	  			.addClass('collapsed');	
  		}
  		
  		
	});
});
var ColorPicker = {};

!function() {
	$.fn.colorPicker = function(options) {

		var keys = [];
		for (key in ColorPicker.colorMap) {
			keys.push(key);
		}

		var settings = {
			colors : keys,
			onSelect : $.noop,
			active: null
		};

		//methods
		if (typeof options == 'string' && options in $(this).data('primer-color-picker')) {
			var method = $(this).data('primer-color-picker')[options];
			return method.apply(method, Array.prototype.slice.call( arguments, 1 ));
		}

		return this.each(function(){
			
			var $this = $(this);
			var config;
			var public = {};
			var currentHover = null;

			var init = function() {
				config = $.extend({}, settings, options);

				$this.addClass('color-picker clearfix');

				for (var i = 0; i < config.colors.length; i++) {
					
					var color = config.colors[i].toUpperCase();
					var convertedColor = ColorPicker.colorStringToHex(color);
					var active = config.active && (config.active.toUpperCase() == color || config.active.toUpperCase() == convertedColor) ? true : false;	
					
					public.addColor(config.colors[i], active);
				}

				//handlers
				$this.on('click.color-picker', '.color-picker-widget', function(e){
					e.preventDefault();
					public.setColor($(this).data('color'));
				});

				$this.on('touchstart', function(){
					$this.addClass('is-touch');
				});

				$this.on('touchend',function(e){
					var el = $(document.elementFromPoint(e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY));
					$this.removeClass('is-touch');
					if (el.hasClass('color-picker-widget')) {
						el.click();
					}

					$this.find('.color-picker-widget').removeClass('hover');
				});

				$this.on('touchmove',function(e){
					
					var el = $(document.elementFromPoint(e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY));
					if (el.hasClass('color-picker-widget')) {
						e.preventDefault();
						
						if(currentHover != el.get(0)) {
							$(currentHover).removeClass('hover');
							currentHover = null;
						}

						if (currentHover == null) {
							el.addClass('hover');
							currentHover = el.get(0);	
						}
						
					}
				});
			};

			public.addColor = function(color, active) {
				var colorWidget = $('<a href="#" class="color-picker-widget"></a>');
				var color = ColorPicker.colorStringToHex(color); 
				colorWidget.css('background-color', color);
				colorWidget.attr('data-color', color);

				$this.append(colorWidget);

				if (active) {
					public.setColor(color);
				}
			};

			public.setColor = function(color) {
				$this.find('.color-picker-widget')
					.removeClass('active hover')
					.filter('[data-color='+ color +']')
						.addClass('active');

				$this.data('color', color);
				$this.trigger('select', [color]);
				config.onSelect(color);
			};

			public.getColor = function() {
				return $this.data('color');
			};

			$this.data('primer-color-picker', public);

			init();	
		});
	};

	ColorPicker.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	};

	ColorPicker.colorStringToHex = function(str) {
		var color = null;
		str = str.replace('#', '').toLowerCase();
		if (str in ColorPicker.colorMap) {
			color = ColorPicker.colorMap[str];
		} else {
			color = str;
		}

		return '#' + color.toUpperCase();
	};

	ColorPicker.getRandom = function() {
		var hex = '';
		var arr = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']

		var n1 = Math.round(Math.random()*15);
		var n2 = Math.round(Math.random()*15);
		var n3 = Math.round(Math.random()*15);
		var n4 = Math.round(Math.random()*15);
		var n5 = Math.round(Math.random()*15);
		var n6 = Math.round(Math.random()*15);
		
		return '#' + arr[n1]+arr[n2]+arr[n3]+arr[n4]+arr[n5]+arr[n6];
	}

	ColorPicker.colorMap = {
		'white' : 'ffffff',
		'ivory' : 'fffff0',
		'ivory1' : 'fffff0',
		'lightyellow' : 'ffffe0',
		'lightyellow1' : 'ffffe0',
		'yellow' : 'ffff00',
		'yellow1' : 'ffff00',
		'snow' : 'fffafa',
		'snow1' : 'fffafa',
		'floralwhite' : 'fffaf0',
		'lemonchiffon' : 'fffacd',
		'lemonchiffon1' : 'fffacd',
		'cornsilk' : 'fff8dc',
		'cornsilk1' : 'fff8dc',
		'khaki1' : 'fff68f',
		'seashell' : 'fff5ee',
		'seashell1' : 'fff5ee',
		'lavenderblush' : 'fff0f5',
		'lavenderblush1' : 'fff0f5',
		'antiquewhite1' : 'ffefdb',
		'papayawhip' : 'ffefd5',
		'lightgoldenrod1' : 'ffec8b',
		'blanchedalmond' : 'ffebcd',
		'wheat1' : 'ffe7ba',
		'mistyrose' : 'ffe4e1',
		'mistyrose1' : 'ffe4e1',
		'bisque' : 'ffe4c4',
		'bisque1' : 'ffe4c4',
		'moccasin' : 'ffe4b5',
		'thistle1' : 'ffe1ff',
		'navajowhite' : 'ffdead',
		'navajowhite1' : 'ffdead',
		'peachpuff' : 'ffdab9',
		'peachpuff1' : 'ffdab9',
		'gold' : 'ffd700',
		'gold1' : 'ffd700',
		'burlywood1' : 'ffd39b',
		'rosybrown1' : 'ffc1c1',
		'goldenrod1' : 'ffc125',
		'pink' : 'ffc0cb',
		'plum1' : 'ffbbff',
		'darkgoldenrod1' : 'ffb90f',
		'lightpink' : 'ffb6c1',
		'pink1' : 'ffb5c5',
		'lightpink1' : 'ffaeb9',
		'tan1' : 'ffa54f',
		'orange' : 'ffa500',
		'orange1' : 'ffa500',
		'lightsalmon' : 'ffa07a',
		'lightsalmon1' : 'ffa07a',
		'salmon1' : 'ff8c69',
		'darkorange' : 'ff8c00',
		'orchid1' : 'ff83fa',
		'palevioletred1' : 'ff82ab',
		'sienna1' : 'ff8247',
		'coral' : 'ff7f50',
		'chocolate1' : 'ff7f24',
		'darkorange1' : 'ff7f00',
		'coral1' : 'ff7256',
		'hotpink1' : 'ff6eb4',
		'indianred1' : 'ff6a6a',
		'hotpink' : 'ff69b4',
		'tomato' : 'ff6347',
		'tomato1' : 'ff6347',
		'orangered' : 'ff4500',
		'orangered1' : 'ff4500',
		'brown1' : 'ff4040',
		'violetred1' : 'ff3e96',
		'maroon1' : 'ff34b3',
		'firebrick1' : 'ff3030',
		'deeppink' : 'ff1493',
		'deeppink1' : 'ff1493',
		'magenta' : 'ff00ff',
		'magenta1' : 'ff00ff',
		'red' : 'ff0000',
		'red1' : 'ff0000',
		'oldlace' : 'fdf5e6',
		'ltgoldenrodyello' : 'fafad2',
		'linen' : 'faf0e6',
		'antiquewhite' : 'faebd7',
		'salmon' : 'fa8072',
		'ghostwhite' : 'f8f8ff',
		'mintcream' : 'f5fffa',
		'whitesmoke' : 'f5f5f5',
		'beige' : 'f5f5dc',
		'wheat' : 'f5deb3',
		'sandybrown' : 'f4a460',
		'azure' : 'f0ffff',
		'azure1' : 'f0ffff',
		'honeydew' : 'f0fff0',
		'honeydew1' : 'f0fff0',
		'aliceblue' : 'f0f8ff',
		'lightcoral' : 'f08080',
		'ivory2' : 'eeeee0',
		'lightyellow2' : 'eeeed1',
		'yellow2' : 'eeee00',
		'snow2' : 'eee9e9',
		'lemonchiffon2' : 'eee9bf',
		'cornsilk2' : 'eee8cd',
		'palegoldenrod' : 'eee8aa',
		'khaki2' : 'eee685',
		'seashell2' : 'eee5de',
		'lavenderblush2' : 'eee0e5',
		'antiquewhite2' : 'eedfcc',
		'lightgoldenrod' : 'eedd82',
		'lightgoldenrod2' : 'eedc82',
		'wheat2' : 'eed8ae',
		'mistyrose2' : 'eed5d2',
		'bisque2' : 'eed5b7',
		'thistle2' : 'eed2ee',
		'navajowhite2' : 'eecfa1',
		'peachpuff2' : 'eecbad',
		'gold2' : 'eec900',
		'burlywood2' : 'eec591',
		'rosybrown2' : 'eeb4b4',
		'goldenrod2' : 'eeb422',
		'plum2' : 'eeaeee',
		'darkgoldenrod2' : 'eead0e',
		'pink2' : 'eea9b8',
		'lightpink2' : 'eea2ad',
		'tan2' : 'ee9a49',
		'orange2' : 'ee9a00',
		'lightsalmon2' : 'ee9572',
		'violet' : 'ee82ee',
		'salmon2' : 'ee8262',
		'orchid2' : 'ee7ae9',
		'palevioletred2' : 'ee799f',
		'sienna2' : 'ee7942',
		'chocolate2' : 'ee7621',
		'darkorange2' : 'ee7600',
		'hotpink2' : 'ee6aa7',
		'coral2' : 'ee6a50',
		'indianred2' : 'ee6363',
		'tomato2' : 'ee5c42',
		'orangered2' : 'ee4000',
		'brown2' : 'ee3b3b',
		'violetred2' : 'ee3a8c',
		'maroon2' : 'ee30a7',
		'firebrick2' : 'ee2c2c',
		'deeppink2' : 'ee1289',
		'magenta2' : 'ee00ee',
		'red2' : 'ee0000',
		'darksalmon' : 'e9967a',
		'gray91' : 'e8e8e8',
		'lavender' : 'e6e6fa',
		'lightcyan' : 'e0ffff',
		'lightcyan1' : 'e0ffff',
		'azure2' : 'e0eeee',
		'honeydew2' : 'e0eee0',
		'mediumorchid1' : 'e066ff',
		'burlywood' : 'deb887',
		'plum' : 'dda0dd',
		'gainsboro' : 'dcdcdc',
		'palevioletred' : 'db7093',
		'goldenrod' : 'daa520',
		'orchid' : 'da70d6',
		'thistle' : 'd8bfd8',
		'lightgray' : 'd3d3d3',
		'tan' : 'd2b48c',
		'chocolate' : 'd2691e',
		'lightcyan2' : 'd1eeee',
		'mediumorchid2' : 'd15fee',
		'violetred' : 'd02090',
		'gray81' : 'cfcfcf',
		'ivory3' : 'cdcdc1',
		'lightyellow3' : 'cdcdb4',
		'yellow3' : 'cdcd00',
		'snow3' : 'cdc9c9',
		'lemonchiffon3' : 'cdc9a5',
		'cornsilk3' : 'cdc8b1',
		'khaki3' : 'cdc673',
		'seashell3' : 'cdc5bf',
		'lavenderblush3' : 'cdc1c5',
		'antiquewhite3' : 'cdc0b0',
		'lightgoldenrod3' : 'cdbe70',
		'wheat3' : 'cdba96',
		'mistyrose3' : 'cdb7b5',
		'bisque3' : 'cdb79e',
		'thistle3' : 'cdb5cd',
		'navajowhite3' : 'cdb38b',
		'peachpuff3' : 'cdaf95',
		'gold3' : 'cdad00',
		'burlywood3' : 'cdaa7d',
		'rosybrown3' : 'cd9b9b',
		'goldenrod3' : 'cd9b1d',
		'plum3' : 'cd96cd',
		'darkgoldenrod3' : 'cd950c',
		'pink3' : 'cd919e',
		'lightpink3' : 'cd8c95',
		'peru' : 'cd853f',
		'tan3' : 'cd853f',
		'orange3' : 'cd8500',
		'lightsalmon3' : 'cd8162',
		'salmon3' : 'cd7054',
		'orchid3' : 'cd69c9',
		'palevioletred3' : 'cd6889',
		'sienna3' : 'cd6839',
		'chocolate3' : 'cd661d',
		'darkorange3' : 'cd6600',
		'hotpink3' : 'cd6090',
		'indianred' : 'cd5c5c',
		'coral3' : 'cd5b45',
		'indianred3' : 'cd5555',
		'tomato3' : 'cd4f39',
		'orangered3' : 'cd3700',
		'brown3' : 'cd3333',
		'violetred3' : 'cd3278',
		'maroon3' : 'cd2990',
		'firebrick3' : 'cd2626',
		'deeppink3' : 'cd1076',
		'magenta3' : 'cd00cd',
		'red3' : 'cd0000',
		'darkolivegreen1' : 'caff70',
		'lightsteelblue1' : 'cae1ff',
		'mediumvioletred' : 'c71585',
		'slategray1' : 'c6e2ff',
		'darkseagreen1' : 'c1ffc1',
		'azure3' : 'c1cdcd',
		'honeydew3' : 'c1cdc1',
		'olivedrab1' : 'c0ff3e',
		'lightblue1' : 'bfefff',
		'darkorchid1' : 'bf3eff',
		'grey' : 'bebebe',
		'darkkhaki' : 'bdb76b',
		'darkolivegreen2' : 'bcee68',
		'lightsteelblue2' : 'bcd2ee',
		'rosybrown' : 'bc8f8f',
		'paleturquoise1' : 'bbffff',
		'mediumorchid' : 'ba55d3',
		'slategray2' : 'b9d3ee',
		'darkgoldenrod' : 'b8860b',
		'grey71' : 'b5b5b5',
		'darkseagreen2' : 'b4eeb4',
		'lightcyan3' : 'b4cdcd',
		'mediumorchid3' : 'b452cd',
		'olivedrab2' : 'b3ee3a',
		'lightblue2' : 'b2dfee',
		'darkorchid2' : 'b23aee',
		'firebrick' : 'b22222',
		'lightskyblue1' : 'b0e2ff',
		'powderblue' : 'b0e0e6',
		'lightsteelblue' : 'b0c4de',
		'maroon' : 'b03060',
		'paleturquoise' : 'afeeee',
		'paleturquoise2' : 'aeeeee',
		'greenyellow' : 'adff2f',
		'lightblue' : 'add8e6',
		'mediumpurple1' : 'ab82ff',
		'darkgrey' : 'a9a9a9',
		'brown' : 'a52a2a',
		'lightskyblue2' : 'a4d3ee',
		'darkolivegreen3' : 'a2cd5a',
		'lightsteelblue3' : 'a2b5cd',
		'sienna' : 'a0522d',
		'purple' : 'a020f0',
		'slategray3' : '9fb6cd',
		'mediumpurple2' : '9f79ee',
		'grey61' : '9c9c9c',
		'darkseagreen3' : '9bcd9b',
		'purple1' : '9b30ff',
		'palegreen1' : '9aff9a',
		'yellowgreen' : '9acd32',
		'olivedrab3' : '9acd32',
		'lightblue3' : '9ac0cd',
		'darkorchid3' : '9a32cd',
		'darkorchid' : '9932cc',
		'palegreen' : '98fb98',
		'cadetblue1' : '98f5ff',
		'darkslategray1' : '97ffff',
		'paleturquoise3' : '96cdcd',
		'darkviolet' : '9400d3',
		'mediumpurple' : '9370db',
		'purple2' : '912cee',
		'palegreen2' : '90ee90',
		'lightgreen' : '90ee90',
		'darkseagreen' : '8fbc8f',
		'cadetblue2' : '8ee5ee',
		'darkslategray2' : '8deeee',
		'lightskyblue3' : '8db6cd',
		'ivory4' : '8b8b83',
		'lightyellow4' : '8b8b7a',
		'yellow4' : '8b8b00',
		'snow4' : '8b8989',
		'lemonchiffon4' : '8b8970',
		'cornsilk4' : '8b8878',
		'seashell4' : '8b8682',
		'khaki4' : '8b864e',
		'lavenderblush4' : '8b8386',
		'antiquewhite4' : '8b8378',
		'lightgoldenrod4' : '8b814c',
		'wheat4' : '8b7e66',
		'mistyrose4' : '8b7d7b',
		'bisque4' : '8b7d6b',
		'thistle4' : '8b7b8b',
		'navajowhite4' : '8b795e',
		'peachpuff4' : '8b7765',
		'gold4' : '8b7500',
		'burlywood4' : '8b7355',
		'rosybrown4' : '8b6969',
		'goldenrod4' : '8b6914',
		'plum4' : '8b668b',
		'darkgoldenrod4' : '8b658b',
		'pink4' : '8b636c',
		'lightpink4' : '8b5f65',
		'tan4' : '8b5a2b',
		'orange4' : '8b5a00',
		'lightsalmon4' : '8b5742',
		'salmon4' : '8b4c39',
		'orchid4' : '8b4789',
		'palevioletred4' : '8b475d',
		'sienna4' : '8b4726',
		'saddlebrown' : '8b4513',
		'chocolate4' : '8b4513',
		'darkorange4' : '8b4500',
		'coral4' : '8b3e2f',
		'hotpink4' : '8b3a62',
		'indianred4' : '8b3a3a',
		'tomato4' : '8b3626',
		'orangered4' : '8b2500',
		'brown4' : '8b2323',
		'violetred4' : '8b2252',
		'maroon4' : '8b1c62',
		'firebrick4' : '8b1a1a',
		'deeppink4' : '8b0a50',
		'magenta4' : '8b008b',
		'darkmagenta' : '8b008b',
		'red4' : '8b0000',
		'darkred' : '8b0000',
		'blueviolet' : '8a2be2',
		'mediumpurple3' : '8968cd',
		'skyblue1' : '87ceff',
		'lightskyblue' : '87cefa',
		'skyblue' : '87ceeb',
		'lightslateblue' : '8470ff',
		'azure4' : '838b8b',
		'honeydew4' : '838b83',
		'slateblue1' : '836fff',
		'grey51' : '828282',
		'aquamarine' : '7fffd4',
		'aquamarine1' : '7fffd4',
		'chartreuse' : '7fff00',
		'chartreuse1' : '7fff00',
		'skyblue2' : '7ec0ee',
		'purple3' : '7d26cd',
		'lawngreen' : '7cfc00',
		'palegreen3' : '7ccd7c',
		'mediumslateblue' : '7b68ee',
		'cadetblue3' : '7ac5cd',
		'lightcyan4' : '7a8b8b',
		'slateblue2' : '7a67ee',
		'mediumorchid4' : '7a378b',
		'darkslategray3' : '79cdcd',
		'lightslategray' : '778899',
		'aquamarine2' : '76eec6',
		'chartreuse2' : '76ee00',
		'slategrey' : '708090',
		'darkolivegreen4' : '6e8b3d',
		'lightsteelblue4' : '6e7b8b',
		'skyblue3' : '6ca6cd',
		'slategray4' : '6c7b8b',
		'olivedrab' : '6b8e23',
		'slateblue' : '6a5acd',
		'darkseagreen4' : '698b69',
		'olivedrab4' : '698b22',
		'dimgrey' : '696969',
		'grey41' : '696969',
		'slateblue3' : '6959cd',
		'lightblue4' : '68838b',
		'darkorchid4' : '68228b',
		'mediumaquamarine' : '66cdaa',
		'aquamarine3' : '66cdaa',
		'chartreuse3' : '66cd00',
		'paleturquoise4' : '668b8b',
		'cornflowerblue' : '6495ed',
		'steelblue1' : '63b8ff',
		'lightskyblue4' : '607b8b',
		'cadetblue' : '5f9ea0',
		'mediumpurple4' : '5d478b',
		'steelblue2' : '5cacee',
		'darkolivegreen' : '556b2f',
		'purple4' : '551a8b',
		'seagreen1' : '54ff9f',
		'palegreen4' : '548b54',
		'cadetblue4' : '53868b',
		'darkslategray4' : '528b8b',
		'steelblue3' : '4f94cd',
		'grey31' : '4f4f4f',
		'seagreen2' : '4eee94',
		'skyblue4' : '4a708b',
		'mediumturquoise' : '48d1cc',
		'royalblue1' : '4876ff',
		'darkslateblue' : '483d8b',
		'slateblue4' : '473c8b',
		'steelblue' : '4682b4',
		'aquamarine4' : '458b74',
		'chartreuse4' : '458b00',
		'seagreen3' : '43cd80',
		'royalblue2' : '436eee',
		'royalblue' : '4169e1',
		'turquoise' : '40e0d0',
		'mediumseagreen' : '3cb371',
		'royalblue3' : '3a5fcd',
		'steelblue4' : '36648b',
		'grey21' : '363636',
		'limegreen' : '32cd32',
		'darkslategray' : '2f4f4f',
		'seagreen' : '2e8b57',
		'seagreen4' : '2e8b57',
		'royalblue4' : '27408b',
		'forestgreen' : '228b22',
		'lightseagreen' : '20b2aa',
		'dodgerblue' : '1e90ff',
		'dodgerblue1' : '1e90ff',
		'dodgerblue2' : '1c86ee',
		'grey11' : '1c1c1c',
		'midnightblue' : '191970',
		'dodgerblue3' : '1874cd',
		'dodgerblue4' : '104e8b',
		'cyan' : '00ffff',
		'cyan1' : '00ffff',
		'springgreen' : '00ff7f',
		'springgreen1' : '00ff7f',
		'green' : '00ff00',
		'green1' : '00ff00',
		'medspringgreen' : '00fa9a',
		'turquoise1' : '00f5ff',
		'cyan2' : '00eeee',
		'springgreen2' : '00ee76',
		'green2' : '00ee00',
		'turquoise2' : '00e5ee',
		'darkturquoise' : '00ced1',
		'cyan3' : '00cdcd',
		'springgreen3' : '00cd66',
		'green3' : '00cd00',
		'turquoise3' : '00c5cd',
		'deepskyblue' : '00bfff',
		'deepskyblue1' : '00bfff',
		'deepskyblue2' : '00b2ee',
		'deepskyblue3' : '009acd',
		'cyan4' : '008b8b',
		'darkcyan' : '008b8b',
		'springgreen4' : '008b45',
		'green4' : '008b00',
		'turquoise4' : '00868b',
		'deepskyblue4' : '00688b',
		'darkgreen' : '006400',
		'blue' : '0000ff',
		'blue1' : '0000ff',
		'blue2' : '0000ee',
		'mediumblue' : '0000cd',
		'blue3' : '0000cd',
		'blue4' : '00008b',
		'darkblue' : '00008b',
		'navyblue' : '000080',
		'black' : '000000'
	}


}(jQuery);



(function($){
	
	/**
	 * Comments Plugin
	 */
	$.fn.comments = function(){

		this.each(function(){
			
			var $this = $(this);
			var mainCommentsContainer = $this.find('> .comments-container');
			var content = $this.data('content');
			var limit = parseInt($this.data('limit'));
			var type = $this.data('type');
			var isReversed = parseInt($this.data('reversed'));
			var loadUrl = $this.data('load-url');
			var placeholders = $this.find('.place-holder');

			/**
			 * Init everything
			 */
			function init() {
				
				// exit if already bound
				if ($this.data('comments')) return;				
				$this.data('comments', true);
				
				//bind handlers
				$this.on('submit.comments', 'form', handleForms);
				$this.on('keypress.comments', 'textarea', textareaKeyHandler);
				$this.on('click.comments', '.load-more', loadMoreBtnHandler);
				$this.on('click.comments', '.place-holder', placeholderHandler);
				$this.on('click.comments', 'a.comment-reply-to', focusReplyField);
				$this.on('click.comments', 'a.comment-like-link', likeComment);
				$this.on('click.comments', '.comment-delete', deleteComment);

				//make sure there is a container to load into
				//then do the initial load and increment
				if (mainCommentsContainer.length) {
					loadComments(loadUrl, $this.data('page'));
					$this.data('page', $this.data('page') + 1);	
				}	
			}


			/**
			 * Handle the ajax submissions of main and reply forms on the wall
			 */
			function handleForms(e) {
				e.preventDefault();
				var form = $(this);
				form.ajaxSubmit({
					now: true,
					success: function(data, status, jqXHR) {

						// This resets the form values
						form.find('textarea:not(:hidden), input:not(:hidden,[type=submit],[type=radio],[type=checkbox])').val('');
						form.find('input[type=radio],input[type=checkbox]').prop('checked', false)
						
						// We check to see if we are in the comment network div. If we are,
						// our container will be the comment replies container
						var container = form.parents('.comment-network').first().find('.comment-replies');
						var prepend = isReversed ? false : !container.length;
						container = container.length ? container : null;

						// add in our new comment						
						addComments(data, false, container, prepend);
					}
				});
			}


			/**
			 * Submit a form from a textarea when enter is pressed
			 */
			function textareaKeyHandler(e) {

				if (e.which == 13) {
					e.preventDefault();
					$(this).closest('form').submit();
				}
			}

			/**
			 * Focus the reply field whenever the comment link is clicked
			 */
			function focusReplyField(e) {
				e.preventDefault();
				$(this).closest('.comment')
					.find('.comment-network').removeClass('none')
					.find('.comment-reply textarea').focus();
			}

			/**
			 * Handles clicking anchors in the placeholder
			 */
			function placeholderHandler(e) {
				$this.find('input:not(:hidden), textarea:not(:hidden)').first().focus();
			}


			/**
			 * Append a comment to a comment list or wall
			 */
			function addComments(html, isLoading, container, prepend) {
				var container = container || mainCommentsContainer;
				if (prepend) {
					container.prepend(html);
					container.scrollTop(0);		
				} else {
					container.append(html);
					container.scrollTop(container[0].scrollHeight);		
				}

				setTimeout(function(){
					container.find('.fade').addClass('in');	
				},10);
				

				checkPlaceholder();
			}

			/**
			 * Delete a comment
			 */
			function deleteComment(e) {
				e.preventDefault();
				var btn = $(this);
				var comment = btn.closest('.comment');
				
				//hide the comment instantly
				comment.slideUp('slow');

				//only remove it on success
				$.ajax({
					url: btn.attr('href'),
					type: 'POST',
					data : {'comment_id': comment.data('pk')},
					error: function() {
						comment.slideDown();
					},
					success: function() {
						comment.remove();
						checkPlaceholder();
					}
				});
				
			}


			/**
			 * Checks on whether to hide or show the placeholder
			 */
			function checkPlaceholder() {
				if (mainCommentsContainer.find('.comment').length) {
					mainCommentsContainer.addClass('has-comments');
					placeholders.detach();
				} else {
					mainCommentsContainer.removeClass('has-comments');
					mainCommentsContainer.append(placeholders);
				}
			}


			/**
			 * Handle load more for main comments and replies
			 */
			function loadMoreBtnHandler(e) {
				e.preventDefault();
				var btn = $(this);
				var objectPk, container = null;
				var comment = btn.closest('.comment, .comments').first();
				var page = comment.data('page');
				
				//check to see if we are loading replies
				//and setup the appropriate data
				if (btn.parent().hasClass('comment-replies-load-more')) {
					objectPk = comment.data('pk');
					page = comment.data('page');
					container = comment.find('.comment-replies');
				}

				btn.addClass('disabled');
				btn.text('loading...');
				
				loadComments(loadUrl, page, objectPk, container, function(){
					btn.parent().hasClass('comment-replies-load-more') ? btn.parent().remove() : btn.remove()
					comment.data('page', comment.data('page') + 1);
				});	
			}


			/**
			 * Load more comments or wall posts
			 */
			function loadComments(url, page, objectPk, container, callback) {
				
				var postData = {
					content: content, 
					limit: limit, 
					page: page,
					type: type,
					isReversed: isReversed
				};

				// check to see if we are requesting an explicit object (for replies)
				// also check for a callback
				if (objectPk) postData['pk'] = objectPk;
				callback = callback || $.noop;

				container = container || mainCommentsContainer;

				//let our container know we are loading
				container.addClass('comments-loading');

				$.get(url, postData, function(data){
					
					// we always prepend if the comments are reversed, or if we are loading comment replies					
					var prepend = isReversed || container && container.hasClass('comment-replies') ? true : false;

					container.removeClass('comments-loading loading');
					addComments(data, true, container, prepend);

					checkPlaceholder();
					setupTooltips();
					callback();					
				});
			}


			/**
			 * Setup the tooltips for likes
			 */
			function setupTooltips() {
				$this.find('.comment-likes a[rel=tooltip]').tooltip();
			};


			/**
			 * Like a comment
			 */
			function likeComment(e) {
				console.log('hERE');
		
				var btn = $(this);
				var url = btn.attr('href');
				var comment = btn.closest('.comment'); 
				var unlike = comment.data('liked') ? 1 : 0;
				var commentLikesContainer = comment.find('.comment-likes').first(); //allows us to get the main likes or the reply likes

				var postData = {
					comment: comment.data('pk'),
					details: commentLikesContainer.hasClass('short') ? 0 : 1,
					unlike: unlike
				};

				comment.find('.comment-network').removeClass('none');
				
				$.post(url, postData, function(data){
					
					//swap the text out
					if (unlike) {
						comment.data('liked', false);
						btn.text('Like');
					} else {
						comment.data('liked', true);
						btn.text('Unlike');
					}

					//add the replies and show or hide the container based on whether or not data came back
					commentLikesContainer.html(data);
					!data ? commentLikesContainer.addClass('none') : commentLikesContainer.removeClass('none');

					setupTooltips();				
				});

				e.preventDefault();
			}


			init();
		});

		return this;
	};


	/**
	 * Document Ready
	 */
	$(function(){
		
		var initComments = function() {
			$('.comments').comments();	
		}

		//primer history listener
		$(window).on('ajaxPageLoaded', initComments);
		initComments();
	});

})(jQuery);
!function() {

    // using jQuery
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}();
if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function() {} }; 
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
		if ((currentPath.split('#')[0] != url.split('#')[0] && state && state.load) || state && state.force) {

			//passing the data through to the beforePage trigger allows us
			//to modify it somewhere else before it comes back
			var loadData = {state: state, url: url, title: title}
			$(window).trigger('beforeAjaxPageLoad', loadData);

			//reset our params incase they changed
			state = loadData.state;
			url = loadData.url;
			title = loadData.title;

			if ('container' in state) {
				var container = $(state.container);
			} else {
				var container = $('#body');
			}
			
			//stop pending request if they switch pages again
			if (currentRequest) currentRequest.abort();

			// the actual page loading handler
			$.ajax({
				url : url,
				data : { layout: state.layout }, 
				beforeSend : function(xhr, settings) {
					currentRequest = xhr;
					if (state.beforeSend) state.beforeSend(xhr, settings);
				},
				complete : function(jqXHR, status) {
					if (status == 'success') {
						document.title = title;
						$(window).trigger('ajaxPageLoaded');

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
			callback : $.noop,
			scroll : false,
			load : true,
			force: false,
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
		$(window).one('ajaxPageLoaded', config.callback);

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
			config.data['force'] = config.force;
			config.data['success'] = false;
			config.data['beforeSend'] = false;

			
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
!function($){

	$.fn.mediaUploader = function() {

		this.each(function(){
			
			var $this = $(this);
			var filesContainer = $this.find('.media-uploader-files');
			var timeout;

			/**
			 * Construct
			 */
			function __init__() {

				//safe escape out if it has been bound already
				if ($this.data('mediaUploader')) return;
				$this.data('mediaUploader', true);

				$this.find('input[type=file]').fileupload({
					dropZone: $this,
					add: add,
					progress: progress,
					done: done
				});

				$(document).bind('dragover', dragEffect);
			}

			/**
			 * Triggered when files get added to the uploader
			 */
			function add(e,data) {
				$(data.files).each(function(){
					console.log(this);
					createFileIcon(this, getFileHash(this));
				});
				data.submit();
			}


			/**
			 * Triggered when it is done uploading
			 */
			function done(e, data) {
				$(data.files).each(function(){
					var fileIcon = $this.find('[data-hash=' + getFileHash(this) + ']');
					fileIcon.find('.upload-progress').val(100).trigger('change');
					fileIcon.find('.panel.flip').removeClass('flip');
					
					drawImagePreview(this, fileIcon);

					//There are some weird 3d issues with webkit. This removes
					//the 3D effect which causes rendering glitches on the page
					setTimeout(function(){
						fileIcon.removeClass('panel');
						fileIcon.find('.back').remove();
					}, 500);
				});
			}


			/**
			 * Progress for each individual file
			 */
			function progress(e, data) {
				$(data.files).each(function(){
					var progress = parseInt(data.loaded / data.total * 100, 10);	
					var file = $this.find('[data-hash=' + getFileHash(this) + ']');
					var uploadProgress = file.find('.upload-progress');
					var animationObject = file.data('animationObject') || $({progress: parseInt(uploadProgress.val())});
					file.data('animationObject', animationObject);
					animationObject.stop().animate(
						{ progress: progress },
						{
							step: function() {
								uploadProgress.val(this.progress).trigger('change');
							}
						}
					);
				});
			}

			
			/**
			 * Creates the file icon and upload progress
			 */
			function createFileIcon(file, hash) {
				var ext = getExtension(file);
				var cssClass = ext ? 'fileicon-' + ext : 'fileicon';

				var icon = $('<div class="fileicon-wrapper" data-hash="'+ hash +'">' +
								'<div class="panel flip">' + 
									'<div class="'+ cssClass +' front"><label>'+ ext.toUpperCase()+'</label></div>' +
									'<div class="fileicon back"><input type="hidden" class="upload-progress" value="0"/></div>' +
								'</div>' +
								'<div class="label">'+ file.name +'</div>' +
							'</div>');

				filesContainer.append(icon);

				var uploadProgress = icon.find('.upload-progress');
				var fileIconBack = icon.find('.back');
				var fileIconFront = icon.find('.front');
				var width = fileIconBack.width() * .5;
				
				uploadProgress.knob({
					skin : 'tron',
					width: width,
					height: width,
					fgColor: fileIconBack.css('color'),
					displayInput: false,
					readOnly: true,
					thickness: .2,
				});

				return icon;
			}

			/**
			 * Draws an image preview for a file
			 */
			function drawImagePreview(file, fileIcon) {
				if (isCanvasSupported()) {
					switch(getExtension(file)) {
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'gif':
							
							fileIcon = fileIcon.find('.front');

							var canvas = $('<canvas/>');
							fileIcon.addClass('has-image fileicon-horizontal');
							fileIcon.append(canvas);
							canvas = canvas.get(0);

							var iconWidth = fileIcon.height();
						    var iconHeight = fileIcon.width();
						   	var iconSize = iconWidth > iconHeight ? iconWidth : iconHeight;
						   	var canvasScale = 4;
							
							canvas.width = iconWidth * canvasScale;
							canvas.height = iconHeight * canvasScale;
							var ctx = canvas.getContext('2d');
						    var url = URL.createObjectURL(file);
						    var img = new Image();
						    
						   
						    img.onload = function() {
						    	var scale = img.width > img.height ? iconSize / img.height : iconSize / img.width;
						    	scale = scale * canvasScale;
						        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);    
						    }
						    img.src = url;   


							break;
					}
				}
			}

			function getExtension(file) {
				var split = file.name.split('.');
				return split.length > 1 ? split[split.length - 1].toLowerCase() : '';
			}

			/**
			 * Takes in the file data a returns a semi unique ID so we can reference it later
			 */
			function getFileHash(data) {
				return $.md5(data.size + data.type + data.name);
			}

			/**
			 * Sets the drag over effect for the body
			 */
			function dragEffect(e) {
				if (!timeout) {
				    $this.addClass('in');
				} else {
				    clearTimeout(timeout);
				}
				if (e.target === $this.get(0)) {
				    $this.addClass('hover');
				} else {
				    $this.removeClass('hover');
				}
				
				timeout = setTimeout(function () {
					timeout = null;
				    $this.removeClass('in hover');
				}, 100);
			}

			function isCanvasSupported(){
				var elem = document.createElement('canvas');
				return !!(elem.getContext && elem.getContext('2d'));
			}


			__init__();
		});

		return this;
	};	

	$(function(){
		var initUploaders = function() {
			$('.media-uploader').mediaUploader();
		};

		$(window).on('ajaxPageLoaded', initUploaders);
		initUploaders();
	});

}(jQuery)
var Modal;

(function($){

	Modal = function(options) {

		var api = {}

		api.templates = {
			'default' : '' +
				'<div id="{{ id }}" class="modal hide fade {{ classes }}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
	  				'<div class="modal-header">' +
	    				'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
	    				'<h3 id="myModalLabel">{{{ title }}}</h3>' +
	  				'</div>' +
	  				'<div class="modal-body">' +
	    				'{{{ content }}}' +
	  				'</div>' +
	  				'<div class="modal-footer">' +
	  				'</div>' +
				'</div>',

			'button' : '<button class="btn">{{ label }}</button>',
		};

		api.create = function(options) {
			return new ModalWindow(options);
		};

		return api;
	}();

	var ModalWindow = function(options) {

		var modal = null;
		var config = null;
		var settings = {
			title : '&nbsp;',
			content: '',
			remote: false,
			id : 'modal-window',
			btns : {
				'Close' : {
					'class' : 'btn btn-primary',
					'data-dismiss' : 'modal'
				}
			}
		};

		var __init__ = function() {
			config = $.extend({}, settings, options);
			createWindow();

			modal.on('click', '.modal-footer button[type=submit]', submitHandler);

			return modal;
		};

		var createWindow = function() {
			var template = Modal.templates[config.template] ? Modal.templates[config.template] : Modal.templates['default'];
			template = Hogan.compile(template);
			
			modal = $(template.render(config))
			modal.on('hidden', function(){
				modal.remove();
			});

			$('body').append(modal);

			for (label in config.btns) {
				createButton(label, config.btns[label]);
			}

			var remote = config.remote;
			delete config.remote;

			modal.modal(config);

			if (remote) {
				modal.find('.modal-body').load(remote, function(){
					modal.trigger('loaded');
					setTimeout(function(){
						modal.find('input, textarea').not(':hidden').first().focus();
					},350);
				});
			}
		};

		var submitHandler = function() {
			modal.find('.modal-body form').submit();
		};

		var createButton = function(label, data) {
			var template = Hogan.compile(Modal.templates['button'])
			var btn = $(template.render({label: label}));

			for (key in data) {
				btn.attr(key, data[key]);
			}

			modal.find('.modal-footer').append(btn);
		};	


		return __init__();
	};

	
	$(function(){
		$('body').on('click', '[data-toggle=dynamic-modal]', function(e){
			e.preventDefault();
			var btn = $(this);
			var options = {};

			if (btn.attr('title') != undefined) options['title'] = btn.attr('title');
			if (btn.attr('href') != undefined) options['remote'] = btn.attr('href');
			if (btn.data('id')) options['id'] = btn.data('id');

			Modal.create(options);
		});
	});

})(jQuery);



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
		$(window).on('ajaxPageLoaded', function(){
			$('#notifications-widget-toggle').notificationWidget();
		});
	});

})(jQuery);
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






!function($){

	var PillComplete = function($this) {

		if ($this.data('bound-pill-auto-complete')) return; 
		$this.data('bound-pill-auto-complete', true);

		var source = $this.data('src');
		var format = $this.data('format') || '{value}';
		var search = $this.data('search') || 'value';
		var matchAll = typeof source == 'string';		
		
		var input = $this.find('.pill-auto-complete-real-input');
		var fakeInput = $this.find('.pill-auto-complete-fake-input');
		var dataInput = $this.find('.pill-auto-complete-data-input');
		
		var container = $this.closest('.pill-auto-complete');
		var autocomplete = null;

		var items = []

		function __init__() {

			var autoCompleteOptions = {
				source : source,
				searchProp: search,
				onSelect: onSelect,
				allowDuplicates: false
			};

			if (matchAll) {
				autoCompleteOptions['matcher'] = function() { return true;};
			}

			autocomplete = fakeInput.autocomplete(autoCompleteOptions);
			dataInput.on('change', resync);
			input.on('change', resync);
			container.on('click', '.btn-pill-autocomplete', removePill);
			fakeInput.on('keydown', keyHandler);
			fakeInput.on('focus focusout', focusHandler).focus();
			container.on('click', function(){
				fakeInput.focus();
			});

			resync();
		}

		function focusHandler(e) {
			e.type == 'focus' ? container.addClass('focus') : container.removeClass('focus');
		}


		function removePill(e) {
			var pill = $(this);

			var item = pill.data('pill');
			var itemIndex = items.indexOf(item);

			autocomplete.autocomplete('removeSelectedItem', item.data);

			if (itemIndex != -1) {
				pill.remove();
				items.splice(itemIndex, 1);
				updateInputs();
			}
		}

		function keyHandler(e) {
			//delete key
			if (e.which == 8) {
				if (fakeInput.val() == '') {
					var pill = container.find('.btn-pill-autocomplete').last();
					removePill.call(pill);
				}
			}
		}


		function updateInputs() {
			var formatted = [];
			var data = [];
			for (var i = 0; i < items.length; i++) {
				data.push(JSON.stringify(items[i]));
				formatted.push(format.format(items[i].data));
			} 

			input.val(formatted.join(';'));
			dataInput.val(data.join(';'));
		}


		/**
		 * Removes all the previous pills and resyncs them
		 * to whatever is in the hidden input
		 */
		function resync() {
			
			$this.find('.btn-pill-autocomplete').remove();
			items = [];
			input.val('');
			autocomplete.autocomplete('purgeSelectedItems');
			var data = dataInput.val().length ? dataInput.val().split(';') : [];

			for (var i = 0; i < data.length; i++) {
				var item = $.parseJSON(data[i]);
				items.push(item);
				autocomplete.autocomplete('addSelectedItem', item.data);
				
				var pill = createPill(item);
				fakeInput.before(pill);

				console.log(pill);
			}

			updateInputs();
		}


		function createPill(data) {
			var pill = $('<a href="#" class="btn btn-primary btn-pill-autocomplete"></a>');
			pill.text(data.value);
			pill.data('pill', data);
			return pill;
		}

		function addItem(val, item) {
			var data = {value: val, data: item}
			var pill = createPill(data);
			fakeInput.before(pill);
			items.push(data);
			updateInputs()
		}

		function onSelect(val, item) {
			fakeInput.val('');
			addItem(val, item);
		}

		__init__();
	};
	
	

	$(function(){

		$('body').on('click focus', '.pill-auto-complete, .pill-auto-complete input', function(e){
			
			var $this = $(this);
			if (!$this.hasClass('pill-auto-complete')) $this = $this.closest('.pill-auto-complete');
			
			new PillComplete($this);
		});
		
		$('.pill-auto-complete').each(function(){
			new PillComplete($(this));
		});
	});

}(jQuery);
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
$(window).on('ajaxPageLoaded', function(){
	$('[data-spy="scroll"]').each(function () {
	  	$(this).scrollspy('refresh');
	});
});
var Toolkit = function() {

	var api = {};

	/************************************************************************************************************************
	 * URL MANIPULATIONS
	 ************************************************************************************************************************/

	/**
	 * Returns an object of url params. Can take a url string, or else it will use the current url
	 */
	api.getUrlParams = function(url) {
		
		var params;
		if (url) {
			params = url.split('?');
			if (params.length == 1) return {}
		} else {
			params = window.location.search;	
		}
		
		var new_params = {};

		if (params.substring(0,1) == '?') {
			params = params.substring(1);	
		}

		//params might be an empty string if there were not get params
		if (params) {
			params = params.split('&');
			for (var i = 0; i < params.length; i++) {
				p = params[i].split('=');
				new_params[p[0]] = p[1];
			}
		}
		
		return new_params;
	};


	/**
	 * Replaces get parameters and returns a complete url
	 * params string. Will add the parameters if not present. This does not modifiy
	 * the actual URL, just returns the string, so subsequent calls will still get
	 * the params frm the current url.
	 * @param params obj|string an object of replacement params or a string of a key
	 * @param val string|int an optinonal value for if params is a single key string
	 * @param url string an optional url to pass to get the params from rather than the current url
	 */
	api.replaceUrlParams = function(params, val, url) {
		var urlParams = api.getUrlParams(url);

		// turn params into an object if not one
		if (typeof params == 'string') {
			var key = params;
			params = {};
			params[key] = val;
		}

		for (key in params) {
			urlParams[key] = params[key];
		}

		return api.objToUrlParamsString(urlParams);
	};


	/**
	 * Deletes get params from a urls get params string, and returns the url string
	 * params string. This does not modifiy the actual URL, just returns the string
	 * so subsequent calls will still get the params frm the current url.
	 * @param params obj|string an object of params to delete or a string of a key
	 * @param val string|int an optinonal value for if params is a single key string
	 */
	api.deleteUrlParams = function(params, val) {
		var urlParams = api.getUrlParams();

		// turn params into an object if not one
		if (typeof params == 'string') {
			var key = params;
			params = {};
			params[key] = val;
		}

		for (key in params) {
			delete urlParams[key];
		}

		return api.objToUrlParamsString(urlParams);
	};


	/**
	 * Takes an object and turns it into a url parameters string
	 */
	api.objToUrlParamsString = function(obj) {
		
		var params = [];
		for (key in obj) {
			var paramString = key + '=' + obj[key];
			params.push(paramString);
		}

		return '?' + params.join('&');
	};


	return api;
}();


(function($){
	
	/*******************************************************************************************************************************
	 * String prototype
	 * A collection of useful functions added directly to the string
	 * objects prototype
	 ******************************************************************************************************************************/

	/**
	 * Trims whitepace off of the front and back of a string
	 */
	String.prototype.trim = String.prototype.trim || function(){
		return this.replace(/^\s+|\s+$/g, "");
	};
	
	/**
	 * Converts a string to camel case
	 */
	String.prototype.toCamel = String.prototype.toCamel || function(){
		var str = this.replace(/((\_|-|\W)[a-z])/gi, function($1){return $1.toUpperCase().replace(/-|_|\W/g,'');});
		return str.charAt(0).toLowerCase() + str.slice(1);
	};
	
	/**
	 * Converts camel case and spaces to dashes
	 */
	String.prototype.toDash = String.prototype.toDash || function(){
		var str = this.replace(/[\W_]/g, '-').replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();}).replace(/--/g, '-');
		if (str.charAt(0) == '-') str = str.substring(1);
		return str
	};
	
	/**
	 * Converts anything to a class name format, camelCased with a capital first letter
	 */
	String.prototype.toClassName = String.prototype.toClassName || function(){
		var str = this.toCamel();
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	/**
	 * Converts a to underscores
	 */
	String.prototype.toUnderscore = String.prototype.toUnderscore || function(){
		var str = this.replace(/[\W-]/g, '_').replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();}).replace(/__/g,'_');
		if (str.charAt(0) == '_') str = str.substring(1);
		return str
	};


	String.random = String.random || function(length) {
		
		if (!length) {
			length = 32;
		}

	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

	    if (! length) {
	        length = Math.floor(Math.random() * chars.length);
	    }

	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    
	    return str;
	};

	/**
	 * String formatting. Example '{0}:{1}-test{2}.format('value', 'something', 'else')' => value:something-testelse
	 * can take arbitrary arguments, an array, or an object with keys pointing to values
	 */
	String.prototype.format = String.prototype.format || function() {
	    var args = arguments[0] instanceof Array || arguments[0] instanceof Object ? arguments[0] : arguments;

    	return this.replace(/{([a-zA-z0-9_\-]+)}/g, function(match, key) { 
			return typeof args[key] != 'undefined' ? args[key] : match;
	    });	    
	};


	

	/*******************************************************************************************************************************
	 * Array prototype
	 * A collection of useful functions added directly to the array
	 * objects prototype
	 ******************************************************************************************************************************/
	
	/**
	 * Polyfill for older browsers that don't support indexOf
	 */
	if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}

	/**
	 * Diff two arrays
	 */
	Array.prototype.diff = Array.prototype.diff || function(b) {
		return this.subtract(b).concat(b.subtract(this));
	};

	/**
	 * Subract an array from the calling array
	 */
	Array.prototype.subtract = Array.prototype.subtract || function(b) {
		var a = this;
		var diff = [];
		for(var i = 0; i < a.length; i++) {
			var found = false;
			for(var j = 0; j < b.length; j++) {
				
				//we are comparing objects
				if (typeof a[i] == 'object' && typeof b[j] == 'object') { 
					if(JSON.stringify(a[i]) === JSON.stringify(b[j])) {
						found = true;
						break;
					}
				} 

				//standard comparison
				else if(a[i] === b[j]) {
					found = true;
					break;
				}
			}

			if(!found) diff.push(a[i]);
		}
		
		return diff;	
	};
	

	/*******************************************************************************************************************************
	 * Math prototype
	 * A collection of useful functions added directly to the math
	 * objects prototype
	 ******************************************************************************************************************************/
	
	/**
	 * Get an int between min and max inclusive
	 */ 
	 Math.between = Math.between || function(min, max, round) {
	 	round = round || false;
	 	var rand = min + (max - min) * Math.random();
	 	return round ? Math.round(rand) : rand;
	 };




/************************************************************************************************
 * Utilities
 ************************************************************************************************/
	

	
})(jQuery);
