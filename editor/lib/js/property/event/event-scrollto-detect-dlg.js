(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventScrollToDetectDlg = function (options) {
		var body, button;
		var el, self = this;

		this._options = options;
		this._editorOrientation = $('.editor-area').IEditor('getOrientation');

		if (this._editorOrientation == ORIENTATION_LANDSCAPE) {
			this._oldEditorScrollPos = $('.editor-area').scrollLeft();
		} else {
			this._oldEditorScrollPos = $('.editor-area').scrollTop();
		}
		this._oldEditorLockSet = {};
		this._oldEditorLockSet[EDITOR_LOCK_MOVE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_MOVE);
		this._oldEditorLockSet[EDITOR_LOCK_SELECT] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_SELECT);
		this._oldEditorLockSet[EDITOR_LOCK_RESIZE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_RESIZE);
		this._oldEditorLockSet[EDITOR_LOCK_CREATE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_CREATE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, true);

		if (options.position) {
			if (this._editorOrientation == ORIENTATION_LANDSCAPE) {
				$('.editor-area').scrollLeft(options.position);
			} else {
				$('.editor-area').scrollTop(options.position);
			}
		}
		body = $('<div></div>').addClass('ia-event-scrollto-detect').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		$('<div></div>').addClass('msg').html(MESSAGE['IA_EVENT_SCROLLTO_DETECT_POSITION']).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-scrollto-detect-apply').attr('data-action', BTN_APPLY).html(MESSAGE['APPLY']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-scrollto-detect-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 220,
			//height: 66,
			right: 120,
			top: 120,
			modal: false,
			el: body,
 			title: MESSAGE['IA_EVENT_SCROLLTO_DETECT'],
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

	inews.property.event.EventScrollToDetectDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		$(el).trigger(EVT_CLOSE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, this._oldEditorLockSet[EDITOR_LOCK_MOVE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, this._oldEditorLockSet[EDITOR_LOCK_RESIZE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, this._oldEditorLockSet[EDITOR_LOCK_SELECT]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, this._oldEditorLockSet[EDITOR_LOCK_CREATE]);

		if (this._editorOrientation == ORIENTATION_LANDSCAPE) {
			$('.editor-area').scrollLeft(this._oldEditorScrollPos);
		} else {
			$('.editor-area').scrollTop(this._oldEditorScrollPos);
		}
		this.dlg.close();
	};
}(jQuery));