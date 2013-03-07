!function($){

	var PillComplete = function($this) {
		var source = $this.data('src');
		var format = $this.data('format') || '{value}';
		var search = $this.data('search') || 'value';
		var matchAll = typeof source == 'string'; 
		var input = $this.find('.pillautocompleteinput');
		var fakeInput = $this.find('.pill-auto-complete-fake-input');
		var container = $this.closest('.pill-auto-complete');
		var items = [];
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
			input.val(items.join(','));
		}

		function onSelect(val, item) {
			fakeInput.val('');
			items.push(format.format(item));
			updateInput();
			var btn = $('<a href="#" class="btn btn-primary btn-pill-autocomplete"></a>');
			btn.text(val);
			btn.data('item', item);
			fakeInput.before(btn);
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