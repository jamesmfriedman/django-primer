!function($){

	var PillComplete = function($this) {
		var source = $this.data('src');
		var format = $this.data('format') || '{value}';
		var search = $this.data('search') || 'value';
		var match = $this.data('match');
		var input = $this.find('.pillautocompleteinput');
		var fakeInput = $this.find('.pill-auto-complete-fake-input');
		var container = $this.find('.pill-auto-complete-container');
		var items = [];
		var autocomplete = null;

		function __init__() {

			var autoCompleteOptions = {
				source : source,
				searchProp: search,
				onSelect: onSelect,
				allowDuplicates: false
			};

			if (match == 'all') {
				autoCompleteOptions['matcher'] = function() { return true;};
			}

			autocomplete = fakeInput.autocomplete(autoCompleteOptions);

			container.on('click', '.btn-pill-auto-complete', removePill);
			fakeInput.on('keyup', keyHandler);
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
					var pill = container.find('.btn-pill-auto-complete').last();
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
			var btn = $('<a href="#" class="btn btn-primary btn-pill-auto-complete"></a>');
			btn.text(val);
			btn.data('item', item);
			container.append(btn);
		}

		__init__();
	};
	
	

	$(function(){
		$('body').on('click', '.pill-auto-complete', function(e){
			var $this = $(this);
			if ($this.data('bound-pill-auto-complete')) return; 
			$this.data('bound-pill-auto-complete', true);
			new PillComplete($this);
		});
	});

}(jQuery);