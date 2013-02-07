!function($){

	$.fn.mediaUploader = function() {

		this.each(function(){
			
			var $this = $(this);
			var filesContainer = $this.find('.media-uploader-files');
			var timeout;

			/**
			 * Construct
			 */
			function __init__() {

				//safe escape out if it has been bound already
				if ($this.data('mediaUploader')) return;
				$this.data('mediaUploader', true);

				$this.find('input[type=file]').fileupload({
					dropZone: $this,
					add: add,
					progress: progress,
					done: done
				});

				$(document).bind('dragover', dragEffect);
			}

			/**
			 * Triggered when files get added to the uploader
			 */
			function add(e,data) {
				$(data.files).each(function(){
					console.log(this);
					createFileIcon(this, getFileHash(this));
				});
				data.submit();
			}


			/**
			 * Triggered when it is done uploading
			 */
			function done(e, data) {
				$(data.files).each(function(){
					var fileIcon = $this.find('[data-hash=' + getFileHash(this) + ']');
					fileIcon.find('.upload-progress').val(100).trigger('change');
					fileIcon.find('.panel.flip').removeClass('flip');
					
					drawImagePreview(this, fileIcon);

					//There are some weird 3d issues with webkit. This removes
					//the 3D effect which causes rendering glitches on the page
					setTimeout(function(){
						fileIcon.removeClass('panel');
						fileIcon.find('.back').remove();
					}, 500);
				});
			}


			/**
			 * Progress for each individual file
			 */
			function progress(e, data) {
				$(data.files).each(function(){
					var progress = parseInt(data.loaded / data.total * 100, 10);	
					var file = $this.find('[data-hash=' + getFileHash(this) + ']');
					var uploadProgress = file.find('.upload-progress');
					var animationObject = file.data('animationObject') || $({progress: parseInt(uploadProgress.val())});
					file.data('animationObject', animationObject);
					animationObject.stop().animate(
						{ progress: progress },
						{
							step: function() {
								uploadProgress.val(this.progress).trigger('change');
							}
						}
					);
				});
			}

			
			/**
			 * Creates the file icon and upload progress
			 */
			function createFileIcon(file, hash) {
				var ext = getExtension(file);
				var cssClass = ext ? 'fileicon-' + ext : 'fileicon';

				var icon = $('<div class="fileicon-wrapper" data-hash="'+ hash +'">' +
								'<div class="panel flip">' + 
									'<div class="'+ cssClass +' front"><label>'+ ext.toUpperCase()+'</label></div>' +
									'<div class="fileicon back"><input type="hidden" class="upload-progress" value="0"/></div>' +
								'</div>' +
								'<div class="label">'+ file.name +'</div>' +
							'</div>');

				filesContainer.append(icon);

				var uploadProgress = icon.find('.upload-progress');
				var fileIconBack = icon.find('.back');
				var fileIconFront = icon.find('.front');
				var width = fileIconBack.width() * .5;
				
				uploadProgress.knob({
					skin : 'tron',
					width: width,
					height: width,
					fgColor: fileIconBack.css('color'),
					displayInput: false,
					readOnly: true,
					thickness: .2,
				});

				return icon;
			}

			/**
			 * Draws an image preview for a file
			 */
			function drawImagePreview(file, fileIcon) {
				if (isCanvasSupported()) {
					switch(getExtension(file)) {
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'gif':
							
							fileIcon = fileIcon.find('.front');

							var canvas = $('<canvas/>');
							fileIcon.addClass('has-image fileicon-horizontal');
							fileIcon.append(canvas);
							canvas = canvas.get(0);

							var iconWidth = fileIcon.height();
						    var iconHeight = fileIcon.width();
						   	var iconSize = iconWidth > iconHeight ? iconWidth : iconHeight;
						   	var canvasScale = 4;
							
							canvas.width = iconWidth * canvasScale;
							canvas.height = iconHeight * canvasScale;
							var ctx = canvas.getContext('2d');
						    var url = URL.createObjectURL(file);
						    var img = new Image();
						    
						   
						    img.onload = function() {
						    	var scale = img.width > img.height ? iconSize / img.height : iconSize / img.width;
						    	scale = scale * canvasScale;
						        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);    
						    }
						    img.src = url;   


							break;
					}
				}
			}

			function getExtension(file) {
				var split = file.name.split('.');
				return split.length > 1 ? split[split.length - 1].toLowerCase() : '';
			}

			/**
			 * Takes in the file data a returns a semi unique ID so we can reference it later
			 */
			function getFileHash(data) {
				return $.md5(data.size + data.type + data.name);
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


			__init__();
		});

		return this;
	};	

	$(function(){
		var initUploaders = function() {
			$('.media-uploader').mediaUploader();
		};

		$(window).on('pageLoaded', initUploaders);
		initUploaders();
	});

}(jQuery)