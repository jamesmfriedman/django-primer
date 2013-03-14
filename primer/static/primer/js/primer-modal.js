var Modal;

(function($){

	Modal = function(options) {

		var api = {}

		api.templates = {
			'default' : '' +
				'<div id="{{ id }}" class="modal hide fade {{ classes }}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
	  				'<div class="modal-header">' +
	    				'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
	    				'<h3 id="myModalLabel">{{{ title }}}</h3>' +
	  				'</div>' +
	  				'<div class="modal-body">' +
	    				'{{{ content }}}' +
	  				'</div>' +
	  				'<div class="modal-footer">' +
	    				'<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>' +
	    				'<button class="btn btn-primary">Save changes</button>' +
	  				'</div>' +
				'</div>'
		};

		api.create = function(options) {
			return new ModalWindow(options);
		};

		return api;
	}();

	var ModalWindow = function(options) {

		var config = null;
		var settings = {
			title : '&nbsp;',
			content: '',
			remote: false,
			id : 'modal-window'
		};

		function __init__() {
			config = $.extend({}, settings, options);
			
			var template = Modal.templates[config.template] ? Modal.templates[config.template] : Modal.templates['default'];
			template = Hogan.compile(template);
			
			var modal = $(template.render(config))
			modal.on('hidden', function(){
				modal.remove();
			});

			var remote = config.remote;
			delete config.remote;

			modal.modal(config);

			if (remote) {
				modal.find('.modal-body').load(remote, function(){
					setTimeout(function(){
						modal.find('input, textarea').not(':hidden').first().focus();
					},300);
				});
			}

			return modal;
		}	


		return __init__();
	};

	
	$(function(){
		$('body').on('click', '[data-toggle=dynamic-modal]', function(e){
			e.preventDefault();
			var btn = $(this);
			var options = {};

			if (btn.attr('title') != undefined) options['title'] = btn.attr('title');
			if (btn.attr('href') != undefined) options['remote'] = btn.attr('href');
			if (btn.data('id')) options['id'] = btn.data('id');

			Modal.create(options);
		});
	});

})(jQuery);


