(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventPlayDlg = function (options) {
		var body, field, select, button;
		var el, self = this;

		this._options = options;

		// 창을 열기전 상태 저장
		this._oldEditorLockSet = {};
		this._oldSelectObjects = $('.editor-area .selected');

		this._oldEditorLockSet[EDITOR_LOCK_MOVE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_MOVE);
		this._oldEditorLockSet[EDITOR_LOCK_SELECT] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_SELECT);
		this._oldEditorLockSet[EDITOR_LOCK_RESIZE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_RESIZE);
		this._oldEditorLockSet[EDITOR_LOCK_CREATE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_CREATE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, false);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, true);

		propertySetLock(true);
		$(this._oldSelectObjects).IObject('unselect');

		body = $('<div></div>').addClass('ia-event-play').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_PLAY_TARGETOBJ']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-play-targetobj').attr('type', 'text').attr('readonly', true).appendTo(field);
		$('<button></button>').attr('id', 'ia-event-play-targetobj-select').html(MESSAGE['IA_EVENT_PLAY_TARGETOBJ_SELECT']).appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_PLAY_ACTION']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-play-action').appendTo(field);
		$('<option></option>').val('play').html(MESSAGE['PLAY']).appendTo(select);
		$('<option></option>').val('stop').html(MESSAGE['STOP']).appendTo(select);
		//$('<option></option>').val('toggle').html(MESSAGE['IA_EVENT_PLAY_TOGGLE']).appendTo(select);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_PLAY_REPEAT']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-play-repeat').appendTo(field);
		$('<option></option>').val('no-repeat').html(MESSAGE['IA_EVENT_PLAY_REPEAT_NO_REPEAT']).appendTo(select);
		$('<option></option>').val('repeat').html(MESSAGE['IA_EVENT_PLAY_REPEAT_REPEAT']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-play-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-play-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 361,
			//height: 108,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_PLAY'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-event-play-targetobj').val(options.data.targetObject);
			$(this._el).find('#ia-event-play-action').val(options.data.action);
			$(this._el).find('#ia-event-play-repeat').val(options.data.eventRepeat);
			$('.editor-area #'+options.data.targetObject).IObject('select');
		}

		$(this._el).find('#ia-event-play-targetobj-select').on(EVT_MOUSECLICK, function (e) {
			self._onSelectTargetObj();

			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#ia-event-play-targetobj').val()) {
					alert(MESSAGE['IA_EVENT_PLAY_TARGET_OBJECT_NOT_SELECTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventPlayDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('#ia-event-play-targetobj-select').off(EVT_MOUSECLICK);
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();

		// 창을 열기전 상태로 회귀
		$('.editor-area .selected').IObject('unselect');
		$(this._oldSelectObjects).IObject('select');

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, this._oldEditorLockSet[EDITOR_LOCK_MOVE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, this._oldEditorLockSet[EDITOR_LOCK_SELECT]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, this._oldEditorLockSet[EDITOR_LOCK_RESIZE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, this._oldEditorLockSet[EDITOR_LOCK_CREATE]);

		propertySetLock(false);
	};

	inews.property.event.EventPlayDlg.prototype._onSelectTargetObj = function () {
		var self = this;
		var selDlg = new inews.property.event.EventSelectTargetObjDlg({
			id: 'ia-event-play-target'
		});
		this.dlg.hide();

		$(selDlg._el).on(EVT_SELECT, function (e, objId) {
			$(self._el).find('#ia-event-play-targetobj').val(objId);
		});
		$(selDlg._el).on(EVT_CLOSE, function () {
			$(this).off(EVT_SELECT);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});
	};

	inews.property.event.EventPlayDlg.prototype.getData = function () {
		return {
			targetObject: $(this._el).find('#ia-event-play-targetobj').val(),
			eventRepeat: $(this._el).find('#ia-event-play-repeat').val(),
			action: $(this._el).find('#ia-event-play-action').val()
		};
	};

	inews.property.event.EventPlayDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));