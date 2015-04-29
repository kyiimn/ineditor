(function ($, undefined) {
	$.namespace('inews.property.animation');

	inews.property.animation.AnimationStyleAddDlg = function (options) {
		var body, field, select, button;
		var el, existCSS, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-animation-style-add').addClass('ia-animation-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_STYLE_ADD_STYLE']).appendTo(field);

		select = $('<select></select>').attr('id', 'ia-animation-style-add-style').appendTo(field);
		$('<option></option>').val('transform-translate-x').html('transform-translate-x').appendTo(select);
		$('<option></option>').val('transform-translate-y').html('transform-translate-y').appendTo(select);
		$('<option></option>').val('transform-rotate').html('transform-rotate').appendTo(select);
		$('<option></option>').val('transform-scale-x').html('transform-scale-x').appendTo(select);
		$('<option></option>').val('transform-scale-y').html('transform-scale-y').appendTo(select);
		$('<option></option>').val('opacity').html('opacity').appendTo(select);
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

		existCSS = options.eventStyleDlg.getCSS();
		$.each(existCSS, function (idx, val) {
			$(select).find('option[value='+val+']').remove();
		});

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-animation-style-add-add').attr('data-action', BTN_ADD).html(MESSAGE['ADD']).appendTo(button);
		$('<button></button>').attr('id', 'ia-animation-style-add-close').attr('data-action', BTN_CLOSE).html(MESSAGE['CLOSE']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 260,
			//height: 56,
			modal: true,
			el: body,
 			title: MESSAGE['IA_ANIMATION_STYLE_ADD'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var css;

			if (action == BTN_ADD) {
				var selectEl = $(self._el).find('#ia-animation-style-add-style');
				css = $(selectEl).val();
				if (options.eventStyleDlg._add(css)) {
					$(selectEl).find('option[value='+css+']').remove();
				}
				return;
			}
			$(self._el).find('.buttonset button').off(EVT_MOUSECLICK);
			self.dlg.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};
}(jQuery));