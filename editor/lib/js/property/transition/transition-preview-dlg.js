(function ($, undefined) {
	$.namespace('inews.property.transition');

	inews.property.transition.TransitionPreviewDlg = function (options) {
		var body, field, select, button;
		var el, existProperty, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-transition-preview').addClass('ia-transition-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_TRANSITION_PREVIEW_CSS']).appendTo(field);
		$('<input></input>').attr('id', 'ia-transition-preview-css').attr('type', 'text').appendTo(field);

		$('<div></div>').addClass('preview-area').appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-transition-preview-close').html(MESSAGE['CLOSE']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 320,
			height: 380,
			modal: true,
			el: body,
 			title: MESSAGE['IA_TRANSTIION_PREVIEW'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		this._makePreview();

		$(this._el).find('.preview-obj').on(EVT_MOUSECLICK, function (e) {
			$(this).toggleClass(self._options.data.property);

			e.preventDefault();
			e.stopPropagation();
		});

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			$(self._el).find('.preview-obj').off(EVT_MOUSECLICK);
			$(self._el).find('.buttonset button').off(EVT_MOUSECLICK);
			self.dlg.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.transition.TransitionPreviewDlg.prototype._makePreview = function () {
		var css, cssVal, div;

		css = 'transition: ';
		cssVal  = this._options.data.property + ' ';
		cssVal += this._options.data.duration + 's ';
		cssVal += this._options.data.timing;
		$(this._el).find('#ia-transition-preview-css').val(css + cssVal);

		div = $('<div></div>').addClass('preview-obj');
		div.css('transition', cssVal);
		div.html('Preview!!');

		$(this._el).find('.preview-area').append(div);

		switch (this._options.data.property) {
			case 'left': div.css('right', 'auto'); break;
			case 'right': div.css('left', 'auto'); break;
			case 'top': div.css('bottom', 'auto'); break;
			case 'bottom': div.css('top', 'auto'); break;
			default: break;
		}
	};
}(jQuery));