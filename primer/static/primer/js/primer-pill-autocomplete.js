!function($){

	var PillComplete = function($this) {
		var source = $this.data('src');
		var format = $this.data('format') || '{value}';
		var search = $this.data('search') || 'value';
		var matchAll = typeof source == 'string';		
		var fakeInput = $this.find('.pill-auto-complete-fake-input');
		var input = fakeInput.siblings('input[type="hidden"]');
		var container = $this.closest('.pill-auto-complete');
		var items = [];
		var vals = [];
		var autocomplete = null;

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
			input.on('change', updatePills);
			container.on('click', '.btn-pill-autocomplete', removePill);
			fakeInput.on('keydown', keyHandler);
			fakeInput.on('focus focusout', focusHandler).focus();
			container.on('click', function(){
				fakeInput.focus();
			});
		}

		function focusHandler(e) {
			e.type == 'focus' ? container.addClass('focus') : container.removeClass('focus');
		}


		function removePill(e) {
			var pill = $(this);
			var item = pill.data('item');
			var itemIndex = items.indexOf(format.format(item));

			autocomplete.autocomplete('removeSelectedItem', item);

			if (itemIndex != -1) {
				pill.remove();
				items.splice(itemIndex, 1);
				vals.splice(itemIndex, 1);
				updateInput();
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

		function updateInput() {
			input.val(items.join(';'));
		}

		/**
		 * Removes all the previous pills and resyncs them
		 * to whatever is in the hidden input
		 */
		function updatePills() {
			
			$this.find('.btn-pill-autocomplete').remove();
			items = []
			vals = []

			for (var i = 0; i < items.length; i++) {
				var pill = createPill(vals[i], items[i]);
				fakeInput.before(pill);
			}
		}


		function createPill(val, item) {
			var pill = $('<a href="#" class="btn btn-primary btn-pill-autocomplete"></a>');
			pill.text(val);
			pill.data('item', item);
			return pill;
		}


		function onSelect(val, item) {
			fakeInput.val('');
			items.push(format.format(item));
			vals.push(val);
			updateInput();
			var pill = createPill(val, item);
			fakeInput.before(pill);
		}

		__init__();
	};
	
	

	$(function(){
		$('body').on('click focus', '.pill-auto-complete, .pill-auto-complete input', function(e){
			
			var $this = $(this);
			if (!$this.hasClass('pill-auto-complete')) $this = $this.closest('.pill-auto-complete');
			
			if ($this.data('bound-pill-auto-complete')) return; 
			$this.data('bound-pill-auto-complete', true);
			new PillComplete($this);
		});
	});

}(jQuery);