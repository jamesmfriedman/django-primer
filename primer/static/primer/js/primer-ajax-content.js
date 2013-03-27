/************************************************************************************************************************************************
 * Ajax Content
 * Ajax content provides an easy way to load content after page load
 * this is done by putting in a placeholder span with an attribute of data-ajax-content
 * which points to the url where the data comes from. The placeholder span will be
 * replaced with the loaded content
 ************************************************************************************************************************************************/
 $(function(){

 	$('[data-ajax-content]').each(function(){
 		var placeholder = $(this);
 		var url = placeholder.data('ajax-content');
 		$.get(url, function(data){
 			if (typeof data == 'object' && 'primer' in data) {
 				html = data.primer.html;
 			} else {
 				html = data;
 			}
 			placeholder.replaceWith(html)
 		});
 	});
 });