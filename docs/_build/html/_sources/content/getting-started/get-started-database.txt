Database
======================

Primer Model
------------------

Primer comes with an abstract base model for you to subclass called ``PrimerModel`` located in ``primer.db.models``. It comes with the following baked in fields.

.. NOTE::
	**Attention!** The following fields have been monkey patched onto Django's ``User``, ``Group``, and ``Site`` models.

.. raw:: html
	
	<table class="table table-striped table-bordered">
		<tbody>
			<tr>
				<td>created</td>
				<td>Datetime that is automatically added when a record is created.</td>
			</tr>
			<tr>
				<td>modified</td>
				<td>Datetime that is automatically updated everytime a record is modified.</td>
			</tr>
			<tr>
				<td>uuid</td>
				<td>An automatically generated Unique Universal Identifier based on UUID Version 1. This gets automatically generated when a record is created.</td>
			</tr>
		</tbody>
	</table>

	
Fields
------------------

The following field types also available in ``primer.db.models``.

.. raw:: html

	<table class="table table-striped table-bordered">
		<tbody>
			<tr>
				<td>PickleField</td>
				<td>A field for storing pickeld (serialized) data. You can set this field to a dict and any serializeable types will be converted to a string and stored int he database. When working with model objects, the data will be returned to you as a dict.</td>
			</tr>
			<tr>
				<td>UUIDField</td>
				<td>A Unique Universal Identifier based on UUID Version 1. This gets automatically generated when a record is created if not explicitly set. There is already a UUID field included in <code>PrimerModel</code>, but the field type is there if you need it.</td>
			</tr>
		</tbody>
	</table>

Examples
------------------

.. code-block:: python

	from primer.db.models import PrimerModel, PickleField, UUIDField

	class MyModel(PrimerModel):
		data = PickleField(blank = True, null = True)
		hash = UUIDField()



