! function($){

	$.fn.fileUploadField = function() {

		this.each(function(){
			
			var $this = $(this);
			var hiddenInput = $(this).next();
			var timeout;
			var filelist = [];
			var maxUploads = $this.data('maxuploads') || 1;
			var isImageField = $this.hasClass('file-image-field');

			/**
			 * Construct
			 */
			function init() {
				//safe escape out if it has been bound already
				if ($this.data('mediaUploader')) return;
				$this.data('mediaUploader', true);

				$this.fileupload({
					url: $this.data('handleurl'),
					dropZone: $this,
					add: add,
					progress: progress,
					done: done,
				});

				$(document).bind('dragover', dragEffect);

				if (isImageField) {
					var names = hiddenInput.val();
					$.get($this.data('handleurl') + names, function(data){
						for (key in data) {
							var dataUri = 'data:image/jpeg;base64,' + data[key];
							addImage(dataUri);
						}
					});
				}
			}

			function addImage(dataUri) {
				var image = $('<a href="#" class="thumbnail file-image-field-thumbnail"><img class="" src="'+ dataUri +'"/></a>')
				hiddenInput.parent().append(image);
			}

			/**
			 * Triggered when files get added to the uploader
			 */
			function add(e, data) {
				console.log(data);
				$(data.files).each(function(){
					filelist.push(this);

					if (isImageField) {
						var reader = new FileReader();
						reader.onload = function (e) {
							addImage(e.target.result);
						}
						reader.readAsDataURL(this);	
					}
					
				});
				data.submit();
			}


			/**
			 * Triggered when it is done uploading
			 */
			function done(e, data) {
				var list = $.parseJSON(data.jqXHR.responseText);
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