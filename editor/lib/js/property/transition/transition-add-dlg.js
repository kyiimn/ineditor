(function ($, undefined) {
	$.namespace('inews.property.transition');

	inews.property.transition.TransitionAddDlg = function (options) {
		var body, field, select, button;
		var el, existProperty, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-transition-add').addClass('ia-transition-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_TRANSITION_ADD_PROPERTY']).appendTo(field);

		select = $('<select></select>').attr('id', 'ia-transition-add-property').appendTo(field);
		if (!options.data) {
			$('<option></option>').val('all').html('all').appendTo(select);
			$('<option></option>').val('left').html('left').appendTo(select);
			$('<option></option>').val('top').html('top').appendTo(select);
			$('<option></option>').val('right').html('right').appendTo(select);
			$('<option></option>').val('bottom').html('bottom').appendTo(select);
			$('<option></option>').val('width').html('width').appendTo(select);
			$('<option></option>').val('height').html('height').appendTo(select);
			$('<option></option>').val('min-width').html('min-width').appendTo(select);
			$('<option></option>').val('min-height').html('min-height').appendTo(select);
			$('<option></option>').val('max-width').html('max-width').appendTo(select);
			$('<option></option>').val('max-height').html('max-height').appendTo(select);
			$('<option></option>').val('margin-top').html('margin-top').appendTo(select);
			$('<option></option>').val('margin-right').html('margin-right').appendTo(select);
			$('<option></option>').val('margin-bottom').html('margin-bottom').appendTo(select);
			$('<option></option>').val('margin-left').html('margin-left').appendTo(select);
			$('<option></option>').val('padding-top').html('padding-top').appendTo(select);
			$('<option></option>').val('padding-right').html('padding-right').appendTo(select);
			$('<option></option>').val('padding-bottom').html('padding-bottom').appendTo(select);
			$('<option></option>').val('padding-left').html('padding-left').appendTo(select);
			$('<option></option>').val('background-color').html('background-color').appendTo(select);
			$('<option></option>').val('font-size').html('font-size').appendTo(select);
			$('<option></option>').val('color').html('color').appendTo(select);
			$('<option></option>').val('border-top-width').html('border-top-width').appendTo(select);
			$('<option></option>').val('border-right-width').html('border-right-width').appendTo(select);
			$('<option></option>').val('border-bottom-width').html('border-bottom-width').appendTo(select);
			$('<option></option>').val('border-left-width').html('border-left-width').appendTo(select);
			$('<option></option>').val('border-color').html('border-color').appendTo(select);
			$('<option></option>').val('opacity').html('opacity').appendTo(select);
			$('<option></option>').val('transform').html('transform').appendTo(select);

			existProperty = options.transition.getProperty();
			$.each(existProperty, function (idx, val) {
				$(select).find('option[value='+val+']').remove();
			});
		} else {
			$('<option></option>').val(options.data.property).html(options.data.property).appendTo(select);
			$(select).attr('disabled', true);
		}

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_TRANSITION_ADD_DURATION']).appendTo(field);
		$('<input></input>').attr('id', 'ia-transition-add-duration').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_TRANSITION_ADD_TIMING']).appendTo(field);

		select = $('<select></select>').attr('id', 'ia-transition-add-timing').appendTo(field);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_LINEAR).html('linear').appendTo(select);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_EASE).html('ease').appendTo(select);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_EASEIN).html('ease-in').appendTo(select);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_EASEOUT).html('ease-out').appendTo(select);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_EASEINOUT).html('ease-in-out').appendTo(select);
		$('<option></option>').val(TRANSITION_TIMING_FUNC_DEFAULT).html('initial').appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		if (options.data) {
			$('<button></button>').attr('id', 'ia-transition-add-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
			$('<button></button>').attr('id', 'ia-transition-add-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);
		} else {
			$('<button></button>').attr('id', 'ia-transition-add-add').attr('data-action', BTN_ADD).html(MESSAGE['ADD']).appendTo(button);
			$('<button></button>').attr('id', 'ia-transition-add-close').attr('data-action', BTN_CLOSE).html(MESSAGE['CLOSE']).appendTo(button);
		}

		this.dlg = new inews.Dialog({
			width: 260,
			height: 104,
			modal: true,
			el: body,
 			title: MESSAGE['IA_TRANSTIION_ADD'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-transition-add-duration').val(options.data.duration);
			$(this._el).find('#ia-transition-add-timing').val(options.data.timing);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var css, data, selectEl;

			switch (action) {
				case BTN_ADD:
					selectEl = $(self._el).find('#ia-transition-add-property');
					data = self.getData();
					if (isNaN(parseFloat(data.duration))) {
						alert(MESSAGE['IA_TRANSITION_ADD_INVALID_DURATION']);
						return;
					}
					if (options.transition._add(data)) {
						$(selectEl).find('option[value='+data.property+']').remove();
					}
					return;

				case BTN_OK:
					data = self.getData();
					if (isNaN(parseFloat(data.duration))) {
						alert(MESSAGE['IA_TRANSITION_ADD_INVALID_DURATION']);
						return;
					}
					options.transition._add(data);
					self.close();
					break;

				case BTN_CANCEL:
				case BTN_CLOSE:
				default:
					self.close();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.transition.TransitionAddDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.transition.TransitionAddDlg.prototype.getData = function () {
		return {
			property: $(this._el).find('#ia-transition-add-property').val(),
			duration: $(this._el).find('#ia-transition-add-duration').val(),
			timing: $(this._el).find('#ia-transition-add-timing').val()
		};
	};

	inews.property.transition.TransitionAddDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));