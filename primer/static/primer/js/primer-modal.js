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
	  				'</div>' +
				'</div>',

			'button' : '<button class="btn">{{ label }}</button>',
		};

		api.create = function(options) {
			return new ModalWindow(options);
		};

		return api;
	}();

	var ModalWindow = function(options) {

		var modal = null;
		var config = null;
		var settings = {
			title : '&nbsp;',
			content: '',
			remote: false,
			id : 'modal-window',
			btns : {
				'Close' : {
					'class' : 'btn btn-primary',
					'data-dismiss' : 'modal'
				}
			}
		};

		var __init__ = function() {
			config = $.extend({}, settings, options);
			createWindow();

			modal.on('click', '.modal-footer button[type=submit]', submitHandler);

			return modal;
		};

		var createWindow = function() {
			var template = Modal.templates[config.template] ? Modal.templates[config.template] : Modal.templates['default'];
			template = Hogan.compile(template);
			
			modal = $(template.render(config))
			modal.on('hidden', function(){
				modal.remove();
			});

			$('body').append(modal);

			for (label in config.btns) {
				createButton(label, config.btns[label]);
			}

			var remote = config.remote;
			delete config.remote;

			modal.modal(config);

			if (remote) {
				modal.find('.modal-body').load(remote, function(){
					modal.trigger('loaded');
					setTimeout(function(){
						modal.find('input, textarea').not(':hidden').first().focus();
					},350);
				});
			}
		};

		var submitHandler = function() {
			modal.find('.modal-body form').submit();
		};

		var createButton = function(label, data) {
			var template = Hogan.compile(Modal.templates['button'])
			var btn = $(template.render({label: label}));

			for (key in data) {
				btn.attr(key, data[key]);
			}

			modal.find('.modal-footer').append(btn);
		};	


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


