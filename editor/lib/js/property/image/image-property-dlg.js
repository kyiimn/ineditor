(function ($, undefined) {
	$.namespace('inews.property.image');

	inews.property.image.ImagePropertyDlg = function (options) {
		var body, field, select, button;
		var el, existProperty, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-image-property').addClass('ia-image-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_IMAGE_PROPERTY_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-image-property-name').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_IMAGE_PROPERTY_TYPE']).appendTo(field);
		$('<input></input>').attr('id', 'ia-image-property-type').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_IMAGE_PROPERTY_FILLTYPE']).appendTo(field);

		select = $('<select></select>').attr('id', 'ia-image-property-filltype').appendTo(field);
		$('<option></option>').val(OBJECT_IMAGE_FILLTYPE_AUTOFIT_INNER).html(MESSAGE['IA_IMAGE_FILLTYPE_AUTOFIT_INNER']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_FILLTYPE_AUTOFIT_OUTER).html(MESSAGE['IA_IMAGE_FILLTYPE_AUTOFIT_OUTER']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_FILLTYPE_FILL).html(MESSAGE['IA_IMAGE_FILLTYPE_FILL']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-image-property-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-image-property-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 260,
			height: 104,
			modal: true,
			el: body,
			title: (!options.data) ? MESSAGE['IA_IMAGE_PROPERTY_ADD'] : MESSAGE['IA_IMAGE_PROPERTY_MODIFY'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			var locType;

			switch (options.data.type) {
				case OBJECT_IMAGE_ITEMTYPE_SERVER:
					locType = MESSAGE['IA_IMAGE_LOCATION_SERVER'];
					break;
				case OBJECT_IMAGE_ITEMTYPE_LINK:
				default:
					locType = MESSAGE['IA_IMAGE_LOCATION_LINK'];
					break;
			}
			$(this._el).find('#ia-image-property-type').attr('disabled', true);
			$(this._el).find('#ia-image-property-type').val(locType);

			$(this._el).find('#ia-image-property-name').attr('disabled', true);
			$(this._el).find('#ia-image-property-name').val(options.data.name);

			$(this._el).find('#ia-image-property-filltype').val(options.data.fill);
		} else {
			$(this._el).find('#ia-image-property-type').attr('disabled', true);
			$(this._el).find('#ia-image-property-type').val(MESSAGE['IA_IMAGE_LOCATION_LINK']);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var name;

			switch (action) {
				case BTN_OK:
					if (self._options.data) {
						name = self._options.data.name;
					} else {
						name = $(self._el).find('#ia-image-property-name').val();
					}
					if (!name) {
						alert(MESSAGE['IA_IMAGE_PROPERTY_NAME_IS_NOT_INPUTTED']);
						return;
					}
					break;

				case BTN_CANCEL:
				default:
					break;
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.image.ImagePropertyDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.image.ImagePropertyDlg.prototype.getData = function () {
		if (this._options.data) {
			return {
				name: this._options.data.name,
				type: this._options.data.type,
				fill: $(this._el).find('#ia-image-property-filltype').val()
			};
		} else {
			return {
				name: $(this._el).find('#ia-image-property-name').val(),
				type: OBJECT_IMAGE_ITEMTYPE_LINK,
				fill: $(this._el).find('#ia-image-property-filltype').val()
			};
		}
	};

	inews.property.image.ImagePropertyDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));