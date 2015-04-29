(function ($, undefined) {
	$.namespace('inews.property.animation');

	inews.property.animation.AnimationPreviewDlg = function (options) {
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

		body = $('<div></div>').addClass('ia-animation-preview').addClass('ia-animation-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_PREVIEW_TARGETOBJ']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-preview-targetobj').attr('type', 'text').attr('disabled', true).appendTo(field);
		$('<button></button>').attr('id', 'ia-animation-preview-targetobj-select').html(MESSAGE['IA_ANIMATION_PREVIEW_TARGETOBJ_SELECT']).appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_PREVIEW_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-preview-name').attr('type', 'text').attr('disabled', true).appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_PREVIEW_DURATION']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-preview-duration').attr('type', 'text').attr('data-style', 'animation-duration').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_PREVIEW_TIMING_FUNCTION']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-animation-preview-timing-function').attr('data-style', 'animation-timing-function').appendTo(field);
		$('<option></option>').val('linear').html('linear').appendTo(select);
		$('<option></option>').val('ease').html('ease').appendTo(select);
		$('<option></option>').val('ease-in').html('ease-in').appendTo(select);
		$('<option></option>').val('ease-out').html('ease-out').appendTo(select);
		$('<option></option>').val('ease-in-out').html('ease-in-out').appendTo(select);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_PREVIEW_DIRECTION']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-animation-preview-direction').attr('data-style', 'animation-direction').appendTo(field);
		$('<option></option>').val('normal').html('normal').appendTo(select);
		$('<option></option>').val('reverse').html('reverse').appendTo(select);
		$('<option></option>').val('alternate').html('alternate').appendTo(select);
		$('<option></option>').val('alternate-reverse').html('alternate-reverse').appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-animation-preview-apply').attr('data-action', BTN_APPLY).html(MESSAGE['APPLY']).appendTo(button);
		$('<button></button>').attr('id', 'ia-animation-preview-close').attr('data-action', BTN_CLOSE).html(MESSAGE['CLOSE']).appendTo(button);

		this.dlg = new inews.Dialog({
			top: 20,
			right: 30,
			width: 362,
			//height: 134,
			modal: false,
			el: body,
 			title: MESSAGE['IA_ANIMATION_PREVIEW'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-animation-preview-name').val(options.data.name);
			if (options.data.targetObject) {
				var obj = $('.editor-area #'+options.data.targetObject);

				$(this._el).find('#ia-animation-preview-duration').val((obj.IObject('css', 'animation-duration'))[0]);
				$(this._el).find('#ia-animation-preview-direction').val((obj.IObject('css', 'animation-direction'))[0]);
				$(this._el).find('#ia-animation-preview-timing-function').val((obj.IObject('css', 'animation-timing-function'))[0]);

				obj.IObject('select');
				this._select(options.data.targetObject);
			} else {
				$(this._el).find('#ia-animation-preview-duration').val(options.data.datas.length - 1);
			}
		}

		$(this._el).find('#ia-animation-preview-targetobj-select').on(EVT_MOUSECLICK, function (e) {
			self._onSelectTargetObj();

			e.preventDefault();
			e.stopPropagation();
		});

		$(this._el).find('input, select').on(EVENT(EVT_CHANGE, EVT_INPUT), function (e) {
			var objId = $(self._el).find('#ia-animation-preview-targetobj').val();
			var style = $(this).attr('data-style');
			if (!objId || !style) return;

			$('.editor-area #'+objId).IObject('css', style, $(this).val());
		});

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			self._el.trigger(EVT_BUTTONCLICK, [action]);
			switch (action) {
				case BTN_APPLY:
					self._apply();
					break;
				default:
					self.close();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.animation.AnimationPreviewDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('#ia-animation-preview-targetobj-select').off(EVT_MOUSECLICK);
		$(el).find('input, select').off(EVENT(EVT_CHANGE, EVT_INPUT));
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();

		// 창을 열기전 상태로 회귀
		$('.editor-area .selected').IObject('unapplyData', 'animation');
		$('.editor-area .selected').IObject('loadCSS');
		$('.editor-area .selected').IObject('unselect');

		$(this._oldSelectObjects).IObject('select');

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, this._oldEditorLockSet[EDITOR_LOCK_MOVE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, this._oldEditorLockSet[EDITOR_LOCK_SELECT]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, this._oldEditorLockSet[EDITOR_LOCK_RESIZE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, this._oldEditorLockSet[EDITOR_LOCK_CREATE]);

		propertySetLock(false);
	};

	inews.property.animation.AnimationPreviewDlg.prototype._select = function (objId) {
		var oldObjId = $(this._el).find('#ia-animation-preview-targetobj').val();
		var oldObj;

		if (oldObjId) {
			$('.editor-area #'+oldObjId).IObject('unapplyData', 'animation');
			$('.editor-area #'+oldObjId).IObject('loadCSS');
		}
		$(this._el).find('#ia-animation-preview-targetobj').val(objId);
		$('.editor-area #'+objId).IObject('saveCSS');
		$('.editor-area #'+objId).IObject('css', 'animation-name', this._options.data.name);
		$('.editor-area #'+objId).IObject('css', 'animation-duration', $(this._el).find('#ia-animation-preview-duration').val());
		$('.editor-area #'+objId).IObject('css', 'animation-delay', 0);
		$('.editor-area #'+objId).IObject('css', 'animation-timing-function', $(this._el).find('#ia-animation-preview-timing-function').val());
		$('.editor-area #'+objId).IObject('css', 'animation-iteration-count', 0);
		$('.editor-area #'+objId).IObject('css', 'animation-direction', $(this._el).find('#ia-animation-preview-direction').val());
		$('.editor-area #'+objId).IObject('css', 'animation-play-state', 'running');

		$('.editor-area #'+objId).IObject('applyData', 'animation');
	};

	inews.property.animation.AnimationPreviewDlg.prototype._apply = function () {
		var objId = $(this._el).find('#ia-animation-preview-targetobj').val();
		var styles = ['animation-name', 'animation-duration', 'animation-direction', 'animation-timing-function'];
		if (!objId) {
			alert(MESSAGE['IA_ANIMATION_PREVIEW_TARGET_OBJECT_NOT_SELECTED']);
			return;
		}
		$.each(styles, function (idx, css) {
			var obj = $('.editor-area #'+objId);
			obj.IObject('saveCSS', css);
			controlStyleSetData(css, obj.IObject('css'));
		});
	};

	inews.property.animation.AnimationPreviewDlg.prototype._onSelectTargetObj = function () {
		var self = this;
		var selDlg = new inews.property.animation.AnimationSelectTargetObjDlg({
			id: 'ia-animation-preview-target'
		});
		this.dlg.hide();

		$(selDlg._el).on(EVT_SELECT, function (e, objId) {
			self._select(objId);
		});
		$(selDlg._el).on(EVT_CLOSE, function () {
			$(this).off(EVT_SELECT);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});
	};

	inews.property.animation.AnimationPreviewDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));