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
					
					lineHeight: $this.css('line-height'),
					letterSpacing: $this.css('letter-spacing'),
					wordWrap: 'break-word',
					position: 'absolute',
					zIndex: -1,
					width: $this.width() - 2, //offset by a few pixels to make sure our text overflows

					fontSize: $this.css('font-size'),
					fontFamily: $this.css('font-family'),
					
					borderColor: 'transparent',

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

				//update the clone in case there is already text in our textarea
				updateClone();

				//bind handlers
				$this.on('keyup.autgrow', updateClone);
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
				val += '&nbsp;';
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
	});

	

})(jQuery);