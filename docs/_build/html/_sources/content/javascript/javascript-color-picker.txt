ColorPicker
==============================

There are not shortage of color pickers on the net, but when I needed one for a project, I found all of the existing ones to be needlessly complex. Primer's Color Picker lets you define a list of colors, and pick them. It also responds to touch events for handheld devices, so you can press a finger down and start dragging over colors.

.. raw:: html

	<div id="color-picker-example-color" class="bs-docs-example">
		<div id="color-picker-example"></div>
		<br/>
		<a href="#" id="expand-color" class="btn btn-primary">Expand Color</a>
	</div>

.. code-block:: javascript
	
	var exampleColor = $('#color-picker-example-color');
			
	var colors = [];
	for (var i = 0; i < 48; i++) {
		colors.push(ColorPicker.getRandom());
	}

	$('#color-picker-example').colorPicker({
		colors: colors,
		active: colors[Math.between(0, colors.length - 1, true)],
		onSelect: function(color) {
			exampleColor.css('background', color);
		}
	});


.. raw:: html

	<script type="text/javascript">
		var exampleColor = $('#color-picker-example-color');
		var expand = false;

		var colors = [];
		for (var i = 0; i < 48; i++) {
			colors.push(ColorPicker.getRandom());
		}

		$('#color-picker-example').colorPicker({
			colors: colors,
			active: colors[Math.between(0, colors.length - 1, true)],
			onSelect: function(color) {
				exampleColor.css('background', color);
				if (expand) {
					$(document.body).css('background', color);
				}
			}
		});

		$('#expand-color').on('click', function(e){
			e.preventDefault();
			var btn = $(this);
			var body = $(document.body);
			if (btn.hasClass('active')) {
				expand = false;
				btn.removeClass('active');
				body.css('background', '');
				body.removeClass('primer-color-example-expanded');
			} else {
				expand = true;
				btn.addClass('active');
				body.addClass('primer-color-example-expanded');
				body.css('background', $('#color-picker-example').colorPicker('getColor'));
			}
		});
	</script>

Options
---------------------
	
Primer's jQuery colorPicker plugin. Call it on any jQuery object and it will populate the contents of the element with the color picker. It takes an object with the following options

.. raw:: html
	
	<table class="table table-striped table-bordered">
		<thead>
			<tr>
				<td>Option</td>
				<td>Type</td>
				<td>Default</td>
				<td>Description</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>colors</td>
				<td>array</td>
				<td>All of the colors in ColorPicker.colorMap</td>
				<td>An array of colors to populate the color picker with. Colors can be either a hex value or string name (i.e. #ef3def or red).</td>
			</tr>
			<tr>
				<td>active</td>
				<td>string</td>
				<td>null</td>
				<td>The starting color for the picker.</td>
			</tr>
			<tr>
				<td>onSelect</td>
				<td>function</td>
				<td>$.noop</td>
				<td>A function to be called when a color is picked. It gets passed the picked color as a hex value.</td>
			</tr>
		</tbody>
	</table>

Methods
------------------------

.colorPicker(options)
################################

.. code-block:: javascript

	$('#color-picker-example').colorPicker(options);

.colorPicker('getColor')
################################

Returns the currently selected color.

.. code-block:: javascript
	
	$('#color-picker-example').colorPicker('getColor');

.colorPicker('setColor', color)
#################################

.. code-block:: javascript
	
	$('#color-picker-example').colorPicker('setColor', '#f2f2f2');


.colorPicker('addColor')
#################################
	
Adds a color to the color picker.

.. code-block:: javascript

	$('#color-picker-example').colorPicker('addColor', 'orange');

Class Methods
---------------------------------

These are some additional utility functions that are exposed on the ``ColorPicker`` class.

.. code-block:: javascript

	ColorPicker.hexToRgb('#ffffff'); //returns an array of rgb values [255,255,255]
	ColorPicker.colorStringToHex('white'); //returns a color from a string name '#FFFFFF';
	ColorPicker.getRandom(); //returns a random hex color

Events
---------------------------------

The color picker will fire a 'select' event which gets passed the event and the current color

.. code-block:: javascript

	$('#color-picker-example').on('select', function(e, color){...});
