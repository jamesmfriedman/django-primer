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