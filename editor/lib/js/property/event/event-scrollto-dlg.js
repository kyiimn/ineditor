(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventScrollToDlg = function (options) {
		var body, field, select, button;
		var el, self = this;

		this._options = options;

		// 창을 열기전 상태 저장
		this._oldEditorLockSet = {};
		this._oldEditorLockSet[EDITOR_LOCK_MOVE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_MOVE);
		this._oldEditorLockSet[EDITOR_LOCK_SELECT] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_SELECT);
		this._oldEditorLockSet[EDITOR_LOCK_RESIZE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_RESIZE);
		this._oldEditorLockSet[EDITOR_LOCK_CREATE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_CREATE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, true);

		propertySetLock(true);

		body = $('<div></div>').addClass('ia-event-scrollto').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_SCROLLTO_POSITION']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-scrollto-position').attr('type', 'text').appendTo(field);

		select = $('<select></select>').attr('id', 'ia-event-scrollto-position-unit').appendTo(field);
		$('<option></option>').val('%').html('%').appendTo(select);
		$('<option></option>').val('px').html('px').appendTo(select);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_SCROLLTO_REPEAT']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-scrollto-repeat').appendTo(field);
		$('<option></option>').val('toggle').html(MESSAGE['IA_EVENT_SCROLLTO_REPEAT_TOGGLE']).appendTo(select);
		$('<option></option>').val('no-repeat').html(MESSAGE['IA_EVENT_SCROLLTO_REPEAT_NO_REPEAT']).appendTo(select);
		$('<option></option>').val('repeat').html(MESSAGE['IA_EVENT_SCROLLTO_REPEAT_REPEAT']).appendTo(select);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_SCROLLTO_FIRE_ENDEVENT']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-scrollto-fire-endevent').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-scrollto-detect').attr('data-action', BTN_DETECT).html(MESSAGE['DETECT']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-scrollto-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-scrollto-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 224,
			//height: 108,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_SCROLLTO'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-event-scrollto-position').val(options.data.position[0]);
			$(this._el).find('#ia-event-scrollto-position-unit').val(options.data.position[1]);
			$(this._el).find('#ia-event-scrollto-repeat').val(options.data.eventRepeat);
			$(this._el).find('#ia-event-scrollto-fire-endevent').val(options.data.endEvent);
		}

		$(this._el).find('#ia-event-scrollto-position-unit').on(EVT_CHANGE, function (e) {
			var orientation = $('.editor-area').IEditor('getOrientation');
			var position = $(self._el).find('#ia-event-scrollto-position');
			var val = parseFloat($(position).val());
			var refSize = (orientation == ORIENTATION_LANDSCAPE) ? $('.editor-area .editor').width() : $('.editor-area .editor').height();

			if (isNaN(val)) return;

			if ($(this).val() == '%') {
				$(position).val(((val / refSize) * 100).toFixed(4));
			} else {
				$(position).val((refSize * (val / 100)).toFixed(4));
			}
		});

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var val;

			switch (action) {
				case BTN_DETECT:
					self._detect();
					return;

				case BTN_OK:
					val = parseFloat($(self._el).find('#ia-event-scrollto-position').val());
					if (isNaN(val)) {
						alert(MESSAGE['IA_EVENT_SCROLLTO_INVALID_SCROLL_POSITION']);
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

	inews.property.event.EventScrollToDlg.prototype._detect = function () {
		var self = this;
		var nowData = this.getData();
		var detectDlg;
		var posPx, orientation;

		orientation = $('.editor-area').IEditor('getOrientation');

		if (!isNaN(parseFloat(nowData.position[0]))) {
			if (nowData.position[1] == '%') {
				if (orientation == ORIENTATION_LANDSCAPE) {
					posPx = ($('.editor-area .editor').height() * (parseFloat(nowData.position[0]) / 100)).toFixed(4);
				} else {
					posPx = ($('.editor-area .editor').width() * (parseFloat(nowData.position[0]) / 100)).toFixed(4);
				}
			} else {
				posPx = nowData.position[0];
			}
		} else {
			posPx = 0;
		}
		detectDlg = new inews.property.event.EventScrollToDetectDlg({
			id: 'ia-event-scrollto-detect',
			position: posPx
		});
		this.dlg.hide();

		$(detectDlg._el).one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_APPLY) {
				var nowData = self.getData();
				var scrollPos;

				if (orientation == ORIENTATION_LANDSCAPE) {
					scrollPos = $('.editor-area').scrollLeft();
					if (nowData.position[1] == '%') {
						scrollPos = ((scrollPos / $('.editor-area .editor').height()) * 100).toFixed(4);
					}
				} else {
					scrollPos = $('.editor-area').scrollTop();
					if (nowData.position[1] == '%') {
						scrollPos = ((scrollPos / $('.editor-area .editor').width()) * 100).toFixed(4);
					}
				}
				$(self._el).find('#ia-event-scrollto-position').val(scrollPos);
			}
			self.dlg.show();
		});
	};

	inews.property.event.EventScrollToDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('#ia-event-scrollto-position-unit').off(EVT_CHANGE);
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();

		// 창을 열기전 상태로 회귀
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, this._oldEditorLockSet[EDITOR_LOCK_MOVE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, this._oldEditorLockSet[EDITOR_LOCK_SELECT]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, this._oldEditorLockSet[EDITOR_LOCK_RESIZE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, this._oldEditorLockSet[EDITOR_LOCK_CREATE]);

		propertySetLock(false);
	};

	inews.property.event.EventScrollToDlg.prototype.getData = function () {
		return {
			eventRepeat: $(this._el).find('#ia-event-scrollto-repeat').val(),
			endEvent: $(this._el).find('#ia-event-scrollto-fire-endevent').val(),
			position: [
				parseFloat($(this._el).find('#ia-event-scrollto-position').val()).toFixed(4),
				$(this._el).find('#ia-event-scrollto-position-unit').val()
			]
		};
	};

	inews.property.event.EventScrollToDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));