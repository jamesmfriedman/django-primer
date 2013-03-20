$(window).on('ajaxPageLoaded', function(){
	$('[data-spy="scroll"]').each(function () {
	  	$(this).scrollspy('refresh');
	});
});