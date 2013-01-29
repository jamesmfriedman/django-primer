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