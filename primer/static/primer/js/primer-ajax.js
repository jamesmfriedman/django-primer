!function() {
	
	/************************************************************************************************************************************************
	 * Primer Ajax
	 * This adds a lot of auto functionality to ajax requests. It works
	 * by getting extra data via json from the server. If the extra
	 * data isnt in the return data, this passes siltently to jQueries standard ajax
	 ************************************************************************************************************************************************/

	/**
	 * global ajax setup
	 */
	$.ajaxSetup({
		cache: false
	});

	
	var jQueryAjax = $.ajax;

	$.ajax = function(options) {

		var resp = jQueryAjax(options);

		resp.fail(function(jqXHR, textStatus, errorThrown){
			var json = null;

			try {
				json = $.parseJSON(jqXHR.responseText)	
			} catch(e) {}
			
			if (json && ('_primer' in json)) {
				
				if ('form_errors' in json['_primer']) handleFormErrors(json['_primer']['form_errors']);
				
			}

		});

		return resp;
	};

	var handleFormErrors = function(formErrors) {
	
		var form = $('form');

		for (name in formErrors) {
			if (name == 'non_field_errors') continue;

			var expression = ('[name="'+ name +'"]');
			var forms = form.has(expression);
			if (forms.length == 1) {
				form = forms;
				break;
			}
		}

		for (name in formErrors) {
			if (formErrors[name].length) {
				
				if (name == 'non_field_errors') {
					form.find('.alert-form-error').remove();

					Notifications.create({
						message : formErrors[name],
						tags : 'alert-error alert-form-error',
						parent: form,
						persist : true
					});
				} else {
					var input = form.find('select[name="'+ name +'"], textarea[name="'+ name +'"], input[name="'+ name +'"]');
					input.closest('.control-group').addClass('error');
					input.siblings('.help-inline-error').remove();
					input.after($('<span class="help-inline help-inline-error">'+ formErrors[name] +'</span>'));	
				}
			}
		}

	};

	
}(jQuery);








