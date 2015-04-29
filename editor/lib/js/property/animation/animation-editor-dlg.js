(function ($, undefined) {
	$.namespace('inews.property.animation');

	inews.property.animation.AnimationEditorDlg = function (options) {
		var body, field, select, table, thead, tr, footer, button;
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

		body = $('<div></div>').addClass('ia-animation-editor').addClass('ia-animation-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_EDITOR_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-editor-name').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(body);

		field = $('<div></div>').addClass('list').appendTo(body);
		table = $('<table></table>').addClass('ia-animation-editor-list').width(361).appendTo(field);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').attr('id', 'ia-animation-editor-header-keyframe').html(MESSAGE['IA_ANIMATION_EDITOR_HEADER_KEYFRAME']).appendTo(tr);
		$('<th></th>').attr('id', 'ia-animation-editor-header-values').html(MESSAGE['IA_ANIMATION_EDITOR_HEADER_VALUES']).appendTo(tr);
		$('<tbody></tbody>').appendTo(table);
		footer = $('<div></div>').addClass('footer').appendTo(field);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-editor-footer-add').attr('data-action', BTN_ADD).attr('title', MESSAGE['IA_ANIMATION_EDITOR_TOOLTIP_ADD']).appendTo(footer);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-editor-footer-modify').attr('data-action', BTN_MODIFY).attr('title', MESSAGE['IA_ANIMATION_EDITOR_TOOLTIP_MODIFY']).appendTo(footer);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-editor-footer-delete').attr('data-action', BTN_DELETE).attr('title', MESSAGE['IA_ANIMATION_EDITOR_TOOLTIP_DELETE']).appendTo(footer);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-style-footer-detect').attr('data-action', BTN_DETECT).attr('title', MESSAGE['IA_ANIMATION_EDITOR_TOOLTIP_DETECT']).appendTo(footer);

		$('<hr></hr>').appendTo(body);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_EDITOR_TARGETOBJ']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-editor-targetobj').attr('type', 'text').attr('readonly', true).appendTo(field);
		$('<button></button>').attr('id', 'ia-animation-editor-targetobj-select').html(MESSAGE['IA_ANIMATION_EDITOR_TARGETOBJ_SELECT']).appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-animation-editor-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-animation-editor-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 361,
			//height: 'auto',
			modal: true,
			el: body,
 			title: MESSAGE['IA_ANIMATION_EDITOR'],
			showCloseBtn: false
		});
		this._addEmptyRow();

		this._el = this.dlg.getEl();
		if (options.data) {
			if (options.data.name) {
				$(this._el).find('#ia-animation-editor-name').val(options.data.name);
				$(this._el).find('#ia-animation-editor-name').attr('disabled', true);
			}
			if (options.data.targetObject) {
				$(this._el).find('#ia-animation-editor-targetobj').val(options.data.targetObject);
				$('.editor-area #'+options.data.targetObject).IObject('select');
			}
			if (options.data.datas) {
				$.each(options.data.datas, function (idx, val) {
					self._add(val);
				});
			}
		}

		$(this._el).find('.ia-animation-editor-list tbody').on(EVT_MOUSECLICK, 'tr', function (e) {
			$(self._el).find('.ia-animation-editor-list tbody tr').removeClass('selected');
			$(this).addClass('selected');

			e.preventDefault();
			e.stopPropagation();
		});
		this.dlg.center();

		$(this._el).find('.footer .button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var el;

			switch (action) {
				case BTN_ADD:
					self._onAdd();
					break;
				case BTN_MODIFY:
					self._onModify();
					break;
				case BTN_DELETE:
					el = $(self._el).find('.ia-animation-editor-list .selected');
					if (el.length > 0) {
						self._remove(el.attr('data-keyframe'));
					}
				case BTN_DETECT:
					self._onDetect();
					break;
				default:
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('#ia-animation-editor-targetobj-select').on(EVT_MOUSECLICK, function (e) {
			self._onSelectTargetObj();

			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#ia-animation-editor-name').val()) {
					alert(MESSAGE['IA_ANIMATION_EDITOR_NAME_IS_NOT_INPUTTED']);
					return;
				}
				if ($(self._el).find('.ia-animation-editor-list tbody tr').length < 1) {
					alert(MESSAGE['IA_ANIMATION_EDITOR_DEFINED_KEYFRAME_NOT_FOUND']);
					return;
				}
			}
			self._el.triggerHandler(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.animation.AnimationEditorDlg.prototype._getRowWidth = function () {
		var ths = $('.ia-animation-editor-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.animation.AnimationEditorDlg.prototype._addEmptyRow = function () {
		var listEl = $('.ia-animation-editor-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.animation.AnimationEditorDlg.prototype._add = function (data) {
		var listEl = $(this._el).find('.ia-animation-editor-list');
		var li, val = '';

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-keyframe="'+data.keyframe+'"]');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-animation-editor-item');
			li.attr('data-keyframe', data.keyframe);
		}
		li.empty();
		li.data('keyframe', data.keyframe);
		li.data('datas', data.datas);

		$('<td></td>').html(data.keyframe).appendTo(li);
		$.each(data.datas, function (idx, css) {
			if (val != '') val += ',';
			val += css.css;
		});
		$('<td></td>').html(val).appendTo(li);

		this._el.find('.ia-animation-editor-list').append(li);

		return true;
	};

	inews.property.animation.AnimationEditorDlg.prototype._remove = function (keyframe) {
		var li = this._el.find('.ia-animation-editor-list tr[data-keyframe="'+keyframe+'"]');
		li.remove();

		this._addEmptyRow();
	};

	inews.property.animation.AnimationEditorDlg.prototype._onSelectTargetObj = function () {
		var self = this;
		var selDlg = selDlg = new inews.property.animation.AnimationSelectTargetObjDlg({
			id: 'ia-animation-editor-target'
		});
		this.dlg.hide();

		$(selDlg._el).on(EVT_SELECT, function (e, objId) {
			$(self._el).find('#ia-animation-editor-targetobj').val(objId);
		});
		$(selDlg._el).on(EVT_CLOSE, function () {
			$(this).off(EVT_SELECT);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});
	};

	inews.property.animation.AnimationEditorDlg.prototype._onAdd = function () {
		var dlg, self = this;

		this.dlg.hide();

		dlg = new inews.property.animation.AnimationStyleDlg({
			id: 'ia-animation-keyframe-add',
			targetObject: $(this._el).find('#ia-animation-editor-targetobj').val(),
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					keyframe: data.keyframe,
					datas: data.datas
				});
			}
			self.dlg.show();
		});
	};

	inews.property.animation.AnimationEditorDlg.prototype._onModify = function () {
		var dlg, dlgOption, li;
		var self = this;

		li = $(this._el).find('.ia-animation-editor-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_ANIMATION_EDITOR_SELECTED_KEYFRAME_NOT_FOUND']);
			return;
		}
		this.dlg.hide();

		dlgOption = {
			id: 'ia-animation-keyframe-modify',
			targetObject: $(this._el).find('#ia-animation-editor-targetobj').val(),
			data: {
				keyframe: li.data('keyframe'),
				datas: li.data('datas')
			}
		};
		dlg = new inews.property.animation.AnimationStyleDlg(dlgOption);
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					keyframe: data.keyframe,
					datas: data.datas
				});
			}
			self.dlg.show();
		});
	};


	inews.property.animation.AnimationEditorDlg.prototype._onDetect = function () {
		var self = this;
		var detectDlg, li, nowData;
		var targetId = $(this._el).find('#ia-animation-editor-targetobj').val();

		li = $(this._el).find('.ia-animation-editor-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_ANIMATION_EDITOR_SELECTED_KEYFRAME_NOT_FOUND']);
			return;
		}

		if (!targetId) {
			alert(MESSAGE['IA_ANIMATION_EDITOR_TARGET_OBJECT_NOT_SELECTED']);
			return;
		}

		nowData = {
			keyframe: li.data('keyframe'),
			datas: li.data('datas')
		};

		detectDlg = new inews.property.animation.AnimationStyleDetectDlg({
			id: 'ia-animation-style-detect',
			css: nowData.datas,
			targetObj: targetId
		});
		this.dlg.hide();

		$(detectDlg._el).on(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_APPLY) {
				var targetObj = $('.editor-area #'+targetId);
				var detectedCSS = $(targetObj).IObject('css');

				var findIdx = function (css) {
					var idx = -1;

					$.each(nowData.datas, function (i, val) {
						if (val['css'] == css) idx = i;
					});
					return idx;
				}

				detectedCSS = $.JSON.decode($.JSON.encode(detectedCSS)); // object copy
				$.each(detectedCSS, function (key, val) {
					var rowIdx;

					rowIdx = findIdx(key);
					if (rowIdx < 0) return;

					nowData.datas[rowIdx]['value'][0] = val[0];
					if (val.length > 1) nowData.datas[rowIdx]['value'][1] = val[1];
				});
				self._add(nowData);
			}
		});
		$(detectDlg._el).on(EVT_CLOSE, function (e) {
			$(this).off(EVT_BUTTONCLICK);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});

	};

	inews.property.animation.AnimationEditorDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.ia-animation-editor-list tbody').off(EVT_MOUSECLICK, 'tr');
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

	inews.property.animation.AnimationEditorDlg.prototype.getData = function () {
		var datas = [];

		$(this._el).find('.ia-animation-editor-list tbody tr').each(function (idx, row) {
			var value = $(row).find('td .value');
			var data = {};
			data.keyframe = $(row).data('keyframe');
			data.datas = $(row).data('datas');
			datas.push(data);
		});
		return {
			name: $(this._el).find('#ia-animation-editor-name').val(),
			targetObject: $(this._el).find('#ia-animation-editor-targetobj').val(),
			datas: datas
		};
	};

	inews.property.animation.AnimationEditorDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));