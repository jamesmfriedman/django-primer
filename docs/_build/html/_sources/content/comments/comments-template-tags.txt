Template Tags
============================

Similar to Django's Comments App, Primer uses template tags for easy implementation. To use any of these, just load the ``primer_comment_tags`` library in your template.

.. raw:: html
	
	<table class="table table-striped table-bordered">
		<thead>
			<tr>
				<th colspan="2">Tags</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>{% comments %}</td>
				<td>Renders a standard comment list. Supports likes, but no replies.</td>
			</tr>
			<tr>
				<td>{% wall %}</td>
				<td>Renders a social network style wall that supports replies.</td>
			</tr>
			<tr>
				<td>{% timeline %}</td>
				<td>Very similar to a wall, but with a much more visiual display.</td>
			</tr>
		</tbody>
	</table>

.. raw:: html

	<table class="table table-striped table-bordered">
		<thead>
			<tr>
				<th colspan="2">Arguments</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>target</td>
				<td><span class="text-error">Required</span>. The database object these comments are attached to.</td>
			</tr>
			<tr>
				<td>stream</td>
				<td>A list or QuerySet of other objects to show comments for. New posts will still be attached to the target, but users will be able to like and reply items in the stream.</td>
			</tr>
			<tr>
				<td>placeholder</td>
				<td>The placeholder text for the comment field in the form. Default is <em>"Write Something..."</em></td>
			</tr>
			<tr>
				<td>limit</td>
				<td>Int. Number of comments to show per page. Default is 10.</td>
			</tr>
			<tr>
				<td>reversed</td>
				<td>1 or 0 a boolean. When reversed, the add comment box will appear at the bottom instead of the top, and the comments will be reversed accordingly. Currently this is only implemented for regular comment lists.</td>
			</tr>
			<tr>
				<td>read_only</td>
				<td>1 or 0 as a boolean. No form will be added if it is read only.</td>
			</tr>
			<tr>
				<td>forms</td>
				<td>A comma separated string of form class names that have been registered with <code>primer.comments.forms.register_comment_form</code>. If not explicitly passed the default forms will be used.</td>
			</tr>
			<tr>
				<td>tab_class</td>
				<td>The comment forms are rendered in a Bootstrap tabs container. This class will override the additional class for the <code>.nav-tabs</code> container. The default is 'nav_pills'</td>
			</tr>
			<tr>
				<td>login_required</td>
				<td>0 or 1 as bool. Whether or not logging in is required for someone to post to the comments. They will still be able to see them. Default is True.</td>
			</tr>
			<tr>
				<td>css_class_name</td>
				<td>An additional css class to append to the main comments container div.</td>
			</tr>
			<tr>
				<td>position</td>
				<td><span class="text-danger">Timeline Only</span>. You can specify 'left', 'right', or 'center'. Default is center.</td>
			</tr>
		</tbody>
	</table>