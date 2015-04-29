(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventFireEventDlg = function (options) {
		var body, field, button;
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

		body = $('<div></div>').addClass('ia-event-fireevent').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_FIREEVENT_TARGETOBJ']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-fireevent-targetobj').attr('type', 'text').attr('disabled', true).appendTo(field);
		$('<button></button>').attr('id', 'ia-event-fireevent-targetobj-select').html(MESSAGE['IA_EVENT_FIREEVENT_TARGETOBJ_SELECT']).appendTo(field);

		field = $('<div></div>').addClass('field').addClass('text').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_FIREEVENT_DEFINED']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-fireevent-defined').appendTo(field);
		$('<option></option>').val('').attr('data-editable', '1').html(MESSAGE['IA_EVENT_FIREEVENT_EVENT_CUSTOM']).appendTo(select);
		$.each(G_EVENT_LIST, function (idx, data) {
			$('<option></option>').val(data.event).attr('data-editable', (data.editable) ? '1' : '0').html(data.name).appendTo(select);
		});

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_FIREEVENT_EVENT']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-fireevent-event').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_FIREEVENT_REPEAT']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-fireevent-repeat').appendTo(field);
		$('<option></option>').val('no-repeat').html(MESSAGE['IA_EVENT_FIREEVENT_REPEAT_NO_REPEAT']).appendTo(select);
		$('<option></option>').val('repeat').html(MESSAGE['IA_EVENT_FIREEVENT_REPEAT_REPEAT']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-fireevent-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-fireevent-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 362,
			//height: 134,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_FIREEVENT'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-event-fireevent-targetobj').val(options.data.targetObject);
			$('.editor-area #'+options.data.targetObject).IObject('select');
			$(this._el).find('#ia-event-fireevent-event').val(options.data.event);
			$(this._el).find('#ia-event-fireevent-repeat').val(options.data.eventRepeat);
		}

		$(this._el).find('#ia-event-fireevent-defined').on(EVT_CHANGE, function (e) {
			var val = $(this).val();
			var opt = $(this).find('option[value="'+val+'"]');
			var editable = parseInt($(opt).attr('data-editable'));

			if (editable) {
				$(self._el).find('#ia-event-fireevent-event').removeAttr('disabled');
			} else {
				$(self._el).find('#ia-event-fireevent-event').attr('disabled', true);
			}
			$(self._el).find('#ia-event-fireevent-event').val(val);
		});

		$(this._el).find('#ia-event-fireevent-targetobj-select').on(EVT_MOUSECLICK, function (e) {
			self._onSelectTargetObj();

			e.preventDefault();
			e.stopPropagation();
		});

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#ia-event-fireevent-targetobj').val()) {
					alert(MESSAGE['IA_EVENT_FIREEVENT_TARGET_OBJECT_NOT_SELECTED']);
					return;
				}
				if (!$(self._el).find('#ia-event-fireevent-event').val()) {
					alert(MESSAGE['IA_EVENT_FIREEVENT_EVENT_IS_NOT_INPUTTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventFireEventDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('#ia-event-fireevent-targetobj-select').off(EVT_MOUSECLICK);
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

	inews.property.event.EventFireEventDlg.prototype._onSelectTargetObj = function () {
		var self = this;
		var selDlg = new inews.property.event.EventSelectTargetObjDlg({
			id: 'ia-event-fireevent-target'
		});
		this.dlg.hide();

		$(selDlg._el).on(EVT_SELECT, function (e, objId) {
			$(self._el).find('#ia-event-fireevent-targetobj').val(objId);
		});
		$(selDlg._el).on(EVT_CLOSE, function () {
			$(this).off(EVT_SELECT);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});
	};

	inews.property.event.EventFireEventDlg.prototype.getData = function () {
		return {
			targetObject: $(this._el).find('#ia-event-fireevent-targetobj').val(),
			event: $(this._el).find('#ia-event-fireevent-event').val(),
			eventRepeat: $(this._el).find('#ia-event-fireevent-repeat').val()
		};
	};

	inews.property.event.EventFireEventDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));