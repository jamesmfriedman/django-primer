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