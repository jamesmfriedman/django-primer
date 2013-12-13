! function($){

	$.fn.fileUploadField = function() {

		this.each(function(){
			
			var $this = $(this);
			var hiddenInput = $(this).next();
			var timeout;
			var filelist = [];
			var maxUploads = $this.data('maxuploads') || 1;
			var isImageField = $this.hasClass('file-upload-field-image');
			var mediaContainer = $this.siblings('.file-upload-media-container');

			var uploaderOptions = {
				url: $this.data('handleurl'),
				dropZone: $this,
				progress: progress,
				done: done
			};

			/**
			 * Construct
			 */
			function init() {
				//safe escape out if it has been bound already
				if ($this.data('mediaUploader')) return;
				$this.data('mediaUploader', true);

				var uploadConfig = $.extend({}, uploaderOptions);

				if (isImageField) {
					uploadConfig = $.extend({}, uploaderOptions, {
						processQueue: [{
		            		action: 'addImagePreview',
		        		}],
		        	});

		        	$.blueimp.fileupload.prototype.processActions = {
				        addImagePreview: function (data, options) {
			        		var reader = new FileReader();
			        		var id = String.random();
			        		$(data.fileInput).data('uniqueId', id);
							reader.onload = function (e) {
								addImage(e.target.result, id);
							}
							reader.readAsDataURL(data.files[0]);

				        }
				    };
				}

				$this.fileupload(uploadConfig);

			
				$(document).bind('dragover', dragEffect);

				if (isImageField) {
					if (hiddenInput.val()) {
						var names = hiddenInput.val();
						$.get($this.data('handleurl') + names + '/', function(data){
							for (key in data) {
								var dataUri = 'data:image/jpeg;base64,' + data[key];
								addImage(dataUri, key);
							}
						});	
					}
					
					mediaContainer.on('click', '.close', function(e){
						e.preventDefault();
						var thumb = $(this).closest('.thumbnail');
						removeItemFromList(thumb.data('id'));
						thumb.remove();
					});
				}
			}

			function addImage(dataUri, id) {
				var image = $('<div class="thumbnail file-image-field-thumbnail" data-id="'+ id +'"><a href="#" title="Delete" class="close">&times;</a><img class="" src="'+ dataUri +'"/></div>')
				mediaContainer.append(image);
			}

			function removeItemFromList(name) {
				var list = hiddenInput.val().split(',');
				if (list.indexOf(name) != -1) {
					list.splice(list.indexOf(name), 1)	
					hiddenInput.val(list.length ? list.join(',') : '');
				}
			}

	
			/**
			 * Triggered when it is done uploading
			 */
			function done(e, data) {
				var list = $.parseJSON(data.jqXHR.responseText);

				if (isImageField) {
					var thumb = mediaContainer.find('[data-id='+ $(data.fileInput).data('uniqueId') +']');	
					thumb.attr('data-id', list[0]);
				}
				
				
				if (hiddenInput.val().length) {
					var prevList = hiddenInput.val().split(',');	
					list = list.concat(prevList);
				} 

				hiddenInput.val(list.join(','));
			}


			/**
			 * Progress for each individual file
			 */
			function progress(e, data) {
				//console.log($(data.fileInput).data('uniqueId'));
				$(data.files).each(function(){
					// var progress = parseInt(data.loaded / data.total * 100, 10);	
					// var file = $this.find('[data-hash=' + getFileHash(this) + ']');
					// var uploadProgress = file.find('.upload-progress');
					// var animationObject = file.data('animationObject') || $({progress: parseInt(uploadProgress.val())});
					// file.data('animationObject', animationObject);
					// animationObject.stop().animate(
					// 	{ progress: progress },
					// 	{
					// 		step: function() {
					// 			uploadProgress.val(this.progress).trigger('change');
					// 		}
					// 	}
					// );
				});
			}

			
			function getExtension(file) {
				var split = file.name.split('.');
				return split.length > 1 ? split[split.length - 1].toLowerCase() : '';
			}

			
			/**
			 * Sets the drag over effect for the body
			 */
			function dragEffect(e) {
				if (!timeout) {
				    $this.addClass('in');
				} else {
				    clearTimeout(timeout);
				}
				if (e.target === $this.get(0)) {
				    $this.addClass('hover');
				} else {
				    $this.removeClass('hover');
				}
				
				timeout = setTimeout(function () {
					timeout = null;
				    $this.removeClass('in hover');
				}, 100);
			}

			function isCanvasSupported(){
				var elem = document.createElement('canvas');
				return !!(elem.getContext && elem.getContext('2d'));
			}


			init();
		});

		return this;
	};	

	$(function(){
		var initUploaders = function() {
			$('.file-upload-field:not([type="hidden"])').fileUploadField();
		};

		$(window).on('ajaxPageLoaded', initUploaders);
		initUploaders();
	});

}(jQuery);