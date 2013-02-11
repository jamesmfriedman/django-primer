$(window).on('pageLoaded', function(){
	$('[data-spy="scroll"]').each(function () {
	  	$(this).scrollspy('refresh');
	});
});