(function ($, undefined) {
	$.namespace('inews.property.animation');

	var DEFAULT_STYLE_FONT_FAMILY = G_FONT_LIST[0]['id'];
	var DEFAULT_STYLE = DEFAULT_OBJECT_STYLE;
	DEFAULT_STYLE['font-family'] = [DEFAULT_STYLE_FONT_FAMILY];

	inews.property.animation.AnimationStyleDlg = function (options) {
		var body, field, select, table, thead, tr, footer, button;
		var el, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-animation-style').addClass('ia-animation-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_ANIMATION_STYLE_KEYFRAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-animation-style-keyframe').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(body);

		field = $('<div></div>').addClass('list').appendTo(body);
		table = $('<table></table>').addClass('ia-animation-style-list').width(361).appendTo(field);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').attr('id', 'ia-animation-style-header-name').html(MESSAGE['IA_ANIMATION_STYLE_HEADER_NAME']).appendTo(tr);
		$('<th></th>').attr('id', 'ia-animation-style-header-new-value').html(MESSAGE['IA_ANIMATION_STYLE_HEADER_NEW_VALUE']).appendTo(tr);
		$('<th></th>').attr('id', 'ia-animation-style-header-new-unit').html(MESSAGE['IA_ANIMATION_STYLE_HEADER_NEW_UNIT']).appendTo(tr);
		$('<tbody></tbody>').appendTo(table);
		footer = $('<div></div>').addClass('footer').appendTo(field);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-style-footer-add').attr('data-action', BTN_ADD).attr('title', MESSAGE['IA_ANIMATION_STYLE_TOOLTIP_ADD']).appendTo(footer);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-style-footer-delete').attr('data-action', BTN_DELETE).attr('title', MESSAGE['IA_ANIMATION_STYLE_TOOLTIP_ADD']).appendTo(footer);
		$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-style-footer-detect').attr('data-action', BTN_DETECT).attr('title', MESSAGE['IA_ANIMATION_STYLE_TOOLTIP_ADD']).appendTo(footer);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-animation-style-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-animation-style-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 361,
			//height: 'auto',
			modal: true,
			el: body,
 			title: MESSAGE['IA_ANIMATION_STYLE'],
			showCloseBtn: false
		});
		this._addEmptyRow();

		this._el = this.dlg.getEl();
		if (options.data) {
			if (options.data.keyframe) {
				$(this._el).find('#ia-animation-style-keyframe').val(options.data.keyframe);
				$(this._el).find('#ia-animation-style-keyframe').attr('disabled', true);
			}
			if (options.data.datas) {
				$.each(options.data.datas, function (idx, val) {
					self._add(val['css'], val['value']);
				});
			}
		}

		$(this._el).find('.ia-animation-style-list tbody').on(EVT_MOUSECLICK, 'tr', function (e) {
			$(self._el).find('.ia-animation-style-list tbody tr').removeClass('selected');
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
					new inews.property.animation.AnimationStyleAddDlg({
						id: 'ia-animation-style-add',
						eventStyleDlg: self
					});
					break;
				case BTN_DELETE:
					el = $(self._el).find('.ia-animation-style-list .selected');
					if (el.length > 0) {
						self._remove(el.attr('data-css'));
					}
					break;
				case BTN_DETECT:
					if (!self._options.targetObject) {
						alert(MESSAGE['IA_ANIMATION_STYLE_TARGET_OBJECT_NOT_SELECTED']);
						return;
					}
					self._detect();
					break;
				default:
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#ia-animation-style-keyframe').val()) {
					alert(MESSAGE['IA_ANIMATION_STYLE_KEYFRAME_IS_NOT_INPUTTED']);
					return;
				}
				if ($(self._el).find('.ia-animation-style-list tbody tr').length < 1) {
					alert(MESSAGE['IA_ANIMATION_STYLE_DEFINED_STYLE_NOT_FOUND']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.animation.AnimationStyleDlg.prototype._getRowWidth = function () {
		var ths = $('.ia-animation-style-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.animation.AnimationStyleDlg.prototype._addEmptyRow = function () {
		var listEl = $('.ia-animation-style-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.animation.AnimationStyleDlg.prototype._add = function (css, newVal) {
		var targetObj = this._options.targetObject;
		var self = this;
		var obj, val, li, span, select;

		if (this._options.targetObject) {
			obj = $('.editor-area #'+this._options.targetObject);
			val = $(obj).IObject('css', css);
		} else {
			val = DEFAULT_STYLE[css];
		}
		if (this._el.find('.ia-animation-style-list tr[data-css='+css+']').length > 0) {
			alert(MESSAGE['IA_ANIMATION_STYLE_EXIST_STYLE']);
			return false;
		}
		this._el.find('.ia-animation-style-list .empty').remove();

		li = $('<tr></tr>');
		li.attr('data-css', css);

		$('<td></td>').html(css).appendTo(li);

		if (!newVal) newVal = val;

		switch (css) {
			case 'left':
			case 'top':
			case 'right':
			case 'bottom':
			case 'width':
			case 'height':
			case 'min-width':
			case 'min-height':
			case 'max-width':
			case 'max-height':
			case 'margin-top':
			case 'margin-right':
			case 'margin-bottom':
			case 'margin-left':
			case 'padding-top':
			case 'padding-right':
			case 'padding-bottom':
			case 'padding-left':
			case 'border-top-left-radius':
			case 'border-top-right-radius':
			case 'border-bottom-right-radius':
			case 'border-bottom-left-radius':
			case 'box-shadow-vertical':
			case 'box-shadow-horizontal':
			case 'box-shadow-blur':
			case 'transform-translate-x':
			case 'transform-translate-y':
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('%').html('%').appendTo(select);
				$('<option></option>').val('px').html('px').appendTo(select);
				select.val(newVal[1]);
				break;

			case 'border-top-width':
			case 'border-right-width':
			case 'border-bottom-width':
			case 'border-left-width':
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('px').html('px').appendTo(select);
				select.val(newVal[1]);
				break;

			case 'font-family':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$.each(G_FONT_LIST, function (idx, val) {
					$('<option></option>').val(newVal['id']).html(newVal['name']).appendTo(select);
				});
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'font-size':
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('pt').html('pt').appendTo(select);
				$('<option></option>').val('px').html('px').appendTo(select);
				$('<option></option>').val('em').html('em').appendTo(select);
				$('<option></option>').val('%').html('%').appendTo(select);
				select.val(newVal[1]);
				break;

			case 'transform-rotate':
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('deg').html('deg').appendTo(select);
				select.val(newVal[1]);
				break;

			case 'overflow-x':
			case 'overflow-y':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('auto').html('auto').appendTo(select);
				$('<option></option>').val('hidden').html('hidden').appendTo(select);
				$('<option></option>').val('scroll').html('scroll').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'visibility':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('visible').html('visible').appendTo(select);
				$('<option></option>').val('hidden').html('hidden').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'position':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('static').html('static').appendTo(select);
				$('<option></option>').val('fixed').html('fixed').appendTo(select);
				$('<option></option>').val('absolute').html('absolute').appendTo(select);
				$('<option></option>').val('relative').html('relative').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'display':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('inline-block').html('inline-block').appendTo(select);
				$('<option></option>').val('inline').html('inline').appendTo(select);
				$('<option></option>').val('block').html('block').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'float':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('none').html('none').appendTo(select);
				$('<option></option>').val('left').html('left').appendTo(select);
				$('<option></option>').val('right').html('right').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'clear':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('none').html('none').appendTo(select);
				$('<option></option>').val('both').html('both').appendTo(select);
				$('<option></option>').val('left').html('left').appendTo(select);
				$('<option></option>').val('right').html('right').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'background-repeat':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('repeat').html('XY').appendTo(select);
				$('<option></option>').val('repeat-x').html('X').appendTo(select);
				$('<option></option>').val('repeat-y').html('Y').appendTo(select);
				$('<option></option>').val('no-repeat').html('none').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'text-align':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('justify').html('Justify').appendTo(select);
				$('<option></option>').val('left').html('Left').appendTo(select);
				$('<option></option>').val('right').html('Right').appendTo(select);
				$('<option></option>').val('center').html('Center').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'font-weight':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('normal').html('Normal').appendTo(select);
				$('<option></option>').val('bold').html('Bold').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'font-style':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('normal').html('Normal').appendTo(select);
				$('<option></option>').val('italic').html('Italic').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'border-style':
				span = $('<td></td>').appendTo(li);
				select = $('<select></select>').addClass('value').appendTo(span);
				$('<option></option>').val('none').html('none').appendTo(select);
				$('<option></option>').val('solid').html('solid').appendTo(select);
				$('<option></option>').val('dotted').html('dotted').appendTo(select);
				$('<option></option>').val('dashed').html('dashed').appendTo(select);
				$('<option></option>').val('double').html('double').appendTo(select);
				select.val(newVal[0]);
				span = $('<td></td>').appendTo(li);
				break;

			case 'background-color':
			case 'color':
			case 'border-color':
			case 'z-index':
			case 'opacity':
			case 'transform-scale-x':
			case 'transform-scale-y':
				span = $('<span></span>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<span></span>').appendTo(li);
				break;

			default:
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[0]).appendTo(span);
				span = $('<td></td>').appendTo(li);
				$('<input></input>').addClass('value').val(newVal[1]).appendTo(span);
				break;
		}
		this._el.find('.ia-animation-style-list').append(li);

		return true;
	};

	inews.property.animation.AnimationStyleDlg.prototype._remove = function (css) {
		var li = this._el.find('.ia-animation-style-list tr[data-css='+css+']');
		li.remove();

		this._addEmptyRow();
	};

	inews.property.animation.AnimationStyleDlg.prototype._detect = function () {
		var self = this;
		var nowData = this.getData();
		var detectDlg;

		if (!this._options.targetObject) {
			alert(MESSAGE['IA_ANIMATION_STYLE_TARGET_OBJECT_NOT_SELECTED']);
			return;
		}
		detectDlg = new inews.property.animation.AnimationStyleDetectDlg({
			id: 'ia-animation-style-detect',
			css: nowData.datas,
			targetObj: this._options.targetObject
		});
		this.dlg.hide();

		$(detectDlg._el).on(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_APPLY) {
				var targetId = self._options.targetObject;
				var targetObj = $('.editor-area #'+targetId);
				var detectedCSS = $(targetObj).IObject('css');

				detectedCSS = $.JSON.decode($.JSON.encode(detectedCSS)); // object copy
				$.each(detectedCSS, function (key, val) {
					var row = $(self._el).find('.ia-animation-style-list tr[data-css="'+key+'"]');
					var rowVal;

					if (row.length < 1) return;

					rowVal = $(row).find('td .value');
					$(rowVal[0]).val(val[0]);
					if (val.length > 1) $(rowVal[1]).val(val[1]);
				});
			}
		});
		$(detectDlg._el).on(EVT_CLOSE, function (e) {
			$(this).off(EVT_BUTTONCLICK);
			$(this).off(EVT_CLOSE);

			self.dlg.show();
		});
	};

	inews.property.animation.AnimationStyleDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.ia-animation-style-list tbody').off(EVT_MOUSECLICK, 'tr');
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.animation.AnimationStyleDlg.prototype.getData = function () {
		var datas = [];

		$(this._el).find('.ia-animation-style-list tbody tr').each(function (idx, row) {
			var value = $(row).find('td .value');
			var data = {};
			data.css = $(row).attr('data-css');
			data.value = [];
			data.value.push($(value[0]).val());
			if (value.length > 1) {
				data.value.push($(value[1]).val());
			}
			datas.push(data);
		});
		return {
			keyframe: $(this._el).find('#ia-animation-style-keyframe').val(),
			datas: datas
		};
	};

	inews.property.animation.AnimationStyleDlg.prototype.getCSS = function () {
		var self = this;
		var css = [];
		this._el.find('.ia-animation-style-list tr').each(function (idx, el) {
			css.push($(this).attr('data-css'));
		});
		return css;
	};

	inews.property.animation.AnimationStyleDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));