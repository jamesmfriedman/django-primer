(function($){
	
	/**
	 * Comments Plugin
	 */
	$.fn.comments = function(){

		this.each(function(){
			
			var $this = $(this);
			var mainCommentsContainer = $this.find('> .comments-container');
			var content = $this.data('content');
			var limit = parseInt($this.data('limit'));
			var type = $this.data('type');
			var isReversed = parseInt($this.data('reversed'));
			var loadUrl = $this.data('load-url');
			var placeholders = $this.find('.place-holder');

			/**
			 * Init everything
			 */
			function init() {
				
				// exit if already bound
				if ($this.data('comments')) return;				
				$this.data('comments', true);
				
				//bind handlers
				$this.on('submit.comments', 'form', handleForms);
				$this.on('keypress.comments', 'textarea', textareaKeyHandler);
				$this.on('click.comments', '.load-more', loadMoreBtnHandler);
				$this.on('click.comments', '.place-holder', placeholderHandler);
				$this.on('click.comments', 'a.comment-reply-to', focusReplyField);
				$this.on('click.comments', 'a.comment-like-link', likeComment);
				$this.on('click.comments', '.comment-delete', deleteComment);

				//make sure there is a container to load into
				//then do the initial load and increment
				if (mainCommentsContainer.length) {
					loadComments(loadUrl, $this.data('page'));
					$this.data('page', $this.data('page') + 1);	
				}	
			}


			/**
			 * Handle the ajax submissions of main and reply forms on the wall
			 */
			function handleForms(e) {
				e.preventDefault();
				var form = $(this);
				form.ajaxSubmit({
					now: true,
					success: function(data, status, jqXHR) {

						// This resets the form values
						form.find('textarea:not(:hidden), input:not(:hidden,[type=submit],[type=radio],[type=checkbox])').val('');
						form.find('input[type=radio],input[type=checkbox]').prop('checked', false)
						
						// We check to see if we are in the comment network div. If we are,
						// our container will be the comment replies container
						var container = form.parents('.comment-network').first().find('.comment-replies');
						var prepend = isReversed ? false : !container.length;
						container = container.length ? container : null;

						// add in our new comment						
						addComments(data, false, container, prepend);
					}
				});
			}


			/**
			 * Submit a form from a textarea when enter is pressed
			 */
			function textareaKeyHandler(e) {

				if (e.which == 13) {
					e.preventDefault();
					$(this).closest('form').submit();
				}
			}

			/**
			 * Focus the reply field whenever the comment link is clicked
			 */
			function focusReplyField(e) {
				e.preventDefault();
				$(this).closest('.comment')
					.find('.comment-network').removeClass('none')
					.find('.comment-reply textarea').focus();
			}

			/**
			 * Handles clicking anchors in the placeholder
			 */
			function placeholderHandler(e) {
				$this.find('input:not(:hidden), textarea:not(:hidden)').first().focus();
			}


			/**
			 * Append a comment to a comment list or wall
			 */
			function addComments(html, isLoading, container, prepend) {
				var container = container || mainCommentsContainer;
				if (prepend) {
					container.prepend(html);
					container.scrollTop(0);		
				} else {
					container.append(html);
					container.scrollTop(container[0].scrollHeight);		
				}

				setTimeout(function(){
					container.find('.fade').addClass('in');	
				},10);
				

				checkPlaceholder();
			}

			/**
			 * Delete a comment
			 */
			function deleteComment(e) {
				e.preventDefault();
				var btn = $(this);
				var comment = btn.closest('.comment');
				
				//hide the comment instantly
				comment.slideUp('slow');

				//only remove it on success
				$.ajax({
					url: btn.attr('href'),
					type: 'POST',
					data : {'comment_id': comment.data('pk')},
					error: function() {
						comment.slideDown();
					},
					success: function() {
						comment.remove();
						checkPlaceholder();
					}
				});
				
			}


			/**
			 * Checks on whether to hide or show the placeholder
			 */
			function checkPlaceholder() {
				if (mainCommentsContainer.find('.comment').length) {
					mainCommentsContainer.addClass('has-comments');
					placeholders.detach();
				} else {
					mainCommentsContainer.removeClass('has-comments');
					mainCommentsContainer.append(placeholders);
				}
			}


			/**
			 * Handle load more for main comments and replies
			 */
			function loadMoreBtnHandler(e) {
				e.preventDefault();
				var btn = $(this);
				var objectPk, container = null;
				var comment = btn.closest('.comment, .comments').first();
				var page = comment.data('page');
				
				//check to see if we are loading replies
				//and setup the appropriate data
				if (btn.parent().hasClass('comment-replies-load-more')) {
					objectPk = comment.data('pk');
					page = comment.data('page');
					container = comment.find('.comment-replies');
				}

				btn.addClass('disabled');
				btn.text('loading...');
				
				loadComments(loadUrl, page, objectPk, container, function(){
					btn.parent().hasClass('comment-replies-load-more') ? btn.parent().remove() : btn.remove()
					comment.data('page', comment.data('page') + 1);
				});	
			}


			/**
			 * Load more comments or wall posts
			 */
			function loadComments(url, page, objectPk, container, callback) {
				
				var postData = {
					content: content, 
					limit: limit, 
					page: page,
					type: type,
					isReversed: isReversed
				};

				// check to see if we are requesting an explicit object (for replies)
				// also check for a callback
				if (objectPk) postData['pk'] = objectPk;
				callback = callback || $.noop;

				container = container || mainCommentsContainer;

				//let our container know we are loading
				container.addClass('comments-loading');

				$.get(url, postData, function(data){
					
					// we always prepend if the comments are reversed, or if we are loading comment replies					
					var prepend = isReversed || container && container.hasClass('comment-replies') ? true : false;

					container.removeClass('comments-loading loading');
					addComments(data, true, container, prepend);

					checkPlaceholder();
					setupTooltips();
					callback();					
				});
			}


			/**
			 * Setup the tooltips for likes
			 */
			function setupTooltips() {
				$this.find('.comment-likes a[rel=tooltip]').tooltip();
			};


			/**
			 * Like a comment
			 */
			function likeComment(e) {
				console.log('hERE');
		
				var btn = $(this);
				var url = btn.attr('href');
				var comment = btn.closest('.comment'); 
				var unlike = comment.data('liked') ? 1 : 0;
				var commentLikesContainer = comment.find('.comment-likes').first(); //allows us to get the main likes or the reply likes

				var postData = {
					comment: comment.data('pk'),
					details: commentLikesContainer.hasClass('short') ? 0 : 1,
					unlike: unlike
				};

				comment.find('.comment-network').removeClass('none');
				
				$.post(url, postData, function(data){
					
					//swap the text out
					if (unlike) {
						comment.data('liked', false);
						btn.text('Like');
					} else {
						comment.data('liked', true);
						btn.text('Unlike');
					}

					//add the replies and show or hide the container based on whether or not data came back
					commentLikesContainer.html(data);
					!data ? commentLikesContainer.addClass('none') : commentLikesContainer.removeClass('none');

					setupTooltips();				
				});

				e.preventDefault();
			}


			init();
		});

		return this;
	};


	/**
	 * Document Ready
	 */
	$(function(){
		
		var initComments = function() {
			$('.comments').comments();	
		}

		//primer history listener
		$(window).on('pageLoaded', initComments);
		initComments();
	});

})(jQuery);