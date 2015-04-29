(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventStyleDetectDlg = function (options) {
		var body, button;
		var el, self = this;

		this._options = options;

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, false);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, false);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, true);

		$('.editor-area').find('.object#'+this._options.targetObj).IObject('saveCSS');

		$.each(this._options.css, function (idx, css) {
			var obj = $('.editor-area').find('.object#'+self._options.targetObj);
			if (css.value == 1) {
				obj.IObject('css', css.css, css.value[0]);
			} else {
				obj.IObject('css', css.css, css.value[0], css.value[1]);
			}
			obj.trigger(EVT_RESIZE);
		});

		body = $('<div></div>').addClass('ia-event-style-detect').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		$('<div></div>').addClass('msg').html(MESSAGE['IA_EVENT_STYLE_DETECT_ACTION']).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-style-detect-apply').attr('data-action', BTN_APPLY).html(MESSAGE['APPLY']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-style-detect-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 220,
			//height: 64,
			right: 120,
			top: 120,
			modal: false,
			el: body,
 			title: MESSAGE['IA_EVENT_STYLE_DETECT'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventStyleDetectDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		$(el).trigger(EVT_CLOSE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, false);

		$('.editor-area').find('.object#'+this._options.targetObj).IObject('loadCSS');
		$('.editor-area').find('.object#'+this._options.targetObj).trigger(EVT_RESIZE);

		this.dlg.close();
	};
}(jQuery));