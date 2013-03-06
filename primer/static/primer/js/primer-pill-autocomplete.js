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

			fakeInput.autocomplete(autoCompleteOptions);
		}

		function onSelect(val, item) {
			fakeInput.val('');
			items.push(format.format(item));
			input.val(items.join(','));
			var btn = $('<a href="#" class="btn btn-primary"></a>');
			btn.text(val);
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