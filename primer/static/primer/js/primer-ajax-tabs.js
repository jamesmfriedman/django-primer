/**
 * Primer Ajax Tabs
 * These are an extension of Bootstraps tab plugin. It allows tabs to ajax load content.
 * It works by setting both the data-target attribute and an href on a tab anchor link.
 */
$(function() {
	$('body').on('shown', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {

		var tab = $(this);	

		// if we have a target and an href, then we will honor the target
		// and load the href
		if (typeof $(this).attr('data-target') !== 'undefined' && typeof $(this).attr('href') !== 'undefined') {

			var url = tab.attr('href');
			var tabContainer = $(tab.attr('data-target'));
			
			//We want to empty the content out, since the old stuff is stale
			//this is a little hack to make sure the height of the container stays the same for the moment
			tabContainer.height(tabContainer.height());
			tabContainer.html('');

			$.loadPage(url, tab.attr('data-target'), function(){
				tabContainer.css('height', '');
			});
		}
	});
});