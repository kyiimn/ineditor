(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventSelectTargetObjDlg = function (options) {
		var body, button;
		var el, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-event-select-target-obj').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		$('<div></div>').addClass('msg').html(MESSAGE['IA_EVENT_SELECT_TARGET_OBJ_DESC']).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').html(MESSAGE['CLOSE']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 220,
			//height: 50,
			right: 120,
			top: 120,
			modal: false,
			el: body,
 			title: MESSAGE['IA_EVENT_SELECT_TARGET_OBJ'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
		$('.editor-area .object').on(EVT_SELECT, function () {
			$(self._el).trigger(EVT_SELECT, $(this).attr('id'));
			self.close();
		});
	};

	inews.property.event.EventSelectTargetObjDlg.prototype.close = function () {
		$('.editor-area .object').off(EVT_SELECT);

		$(this._el).find('.buttonset button').off(EVT_MOUSECLICK);
		$(this._el).trigger(EVT_CLOSE);

		this.dlg.close();
	};
}(jQuery));