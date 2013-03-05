!function($){

	var PillComplete = function($this) {
		var source = $this.data('src');
		var input = $this.find('.pillautocompleteinput');
		var fakeInput = $this.find('.pill-auto-complete-fake-input');
		var format = '{key}:{value}:{display_value}';
		var items = [];

		function __init__() {
			fakeInput.autocomplete({
				source : source,
				searchProp: 'display_value',
				onSelect: onSelect,
				allowDuplicates: false
			});
		}

		function onSelect(val, item) {
			fakeInput.val('');
			items.push(format.format(item));
			input.val(items.join(','));
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