function _onControlLayoutChange(e) {
	var editor = $('.editor-area');

	if (!G_CONTROL_SELECT_OBJECT) return;

	if (!G_CONTROL_MULTISELECT) {
		var style = $(this).attr('data-style');
		var id = $(this).attr('id');
		var val = $(this).val();
		var css = $(G_CONTROL_SELECT_OBJECT).IObject('css', style);
		var parent = $(G_CONTROL_SELECT_OBJECT).parent();
		var refSize;

		if ($(editor).IEditor('getOrientation') == ORIENTATION_LANDSCAPE) {
			refSize = $(parent).height();
		} else {
			refSize = $(parent).width();
		}
		switch (id) {
			case 'el-attr-layout-left-unit':
			case 'el-attr-layout-right-unit':
			case 'el-attr-layout-size-x-unit':
			case 'el-attr-layout-min-size-x-unit':
			case 'el-attr-layout-max-size-x-unit':
			case 'el-attr-layout-margin-top-unit':
			case 'el-attr-layout-margin-bottom-unit':
			case 'el-attr-layout-padding-top-unit':
			case 'el-attr-layout-padding-bottom-unit':
				if (css[0] == 'auto' || css[1] != val) {
					if (val == '%' && css[1] == 'px') {
						css[0] = (css[0] / refSize) * 100;
						css[1] = val;
					} else if (val == 'px' && css[1] == '%') {
						css[0] = refSize * (css[0] / 100);
						css[1] = val;
					}
					$(G_CONTROL_SELECT_OBJECT).IObject('css', style, css[0], css[1]);
				}
				break;

			case 'el-attr-layout-top-unit':
			case 'el-attr-layout-bottom-unit':
			case 'el-attr-layout-size-y-unit':
			case 'el-attr-layout-min-size-y-unit':
			case 'el-attr-layout-max-size-y-unit':
			case 'el-attr-layout-margin-right-unit':
			case 'el-attr-layout-margin-left-unit':
			case 'el-attr-layout-padding-right-unit':
			case 'el-attr-layout-padding-left-unit':
				if (css[0] == 'auto' || css[1] != val) {
					if (val == '%' && css[1] == 'px') {
						css[0] = (css[0] / refSize) * 100;
						css[1] = val;
					} else if (val == 'px' && css[1] == '%') {
						css[0] = refSize * (css[0] / 100);
						css[1] = val;
					}
					$(G_CONTROL_SELECT_OBJECT).IObject('css', style, css[0], css[1]);
				}
				break;

			case 'el-attr-layout-left':
			case 'el-attr-layout-top':
			case 'el-attr-layout-right':
			case 'el-attr-layout-bottom':
			case 'el-attr-layout-size-x':
			case 'el-attr-layout-size-y':
			case 'el-attr-layout-min-size-x':
			case 'el-attr-layout-min-size-y':
			case 'el-attr-layout-max-size-x':
			case 'el-attr-layout-max-size-y':
			case 'el-attr-layout-margin-top':
			case 'el-attr-layout-margin-right':
			case 'el-attr-layout-margin-bottom':
			case 'el-attr-layout-margin-left':
			case 'el-attr-layout-padding-top':
			case 'el-attr-layout-padding-right':
			case 'el-attr-layout-padding-bottom':
			case 'el-attr-layout-padding-left':
				$(G_CONTROL_SELECT_OBJECT).IObject('css', style, val, css[1]);
				break;

			case 'el-attr-layout-lock-resize':
				if (val == 'unlock') {
					$(G_CONTROL_SELECT_OBJECT).IObject('setLockResize', false);
				} else {
					$(G_CONTROL_SELECT_OBJECT).IObject('setLockResize', true);
				}
				break;
			case 'el-attr-layout-lock-move':
				if (val == 'unlock') {
					$(G_CONTROL_SELECT_OBJECT).IObject('setLockMove', false);
				} else {
					$(G_CONTROL_SELECT_OBJECT).IObject('setLockMove', true);
				}
				break;

			default:
				$(G_CONTROL_SELECT_OBJECT).IObject('css', style, val);
				break;
		}
	} else {
		var style = $(this).attr('data-style');
		var id = $(this).attr('id');
		var val = $(this).val();

		switch (id) {
			case 'el-attr-layout-left-unit':
			case 'el-attr-layout-right-unit':
			case 'el-attr-layout-size-x-unit':
			case 'el-attr-layout-min-size-x-unit':
			case 'el-attr-layout-max-size-x-unit':
			case 'el-attr-layout-margin-top-unit':
			case 'el-attr-layout-margin-bottom-unit':
			case 'el-attr-layout-padding-top-unit':
			case 'el-attr-layout-padding-bottom-unit':
			case 'el-attr-layout-top-unit':
			case 'el-attr-layout-bottom-unit':
			case 'el-attr-layout-size-y-unit':
			case 'el-attr-layout-min-size-y-unit':
			case 'el-attr-layout-max-size-y-unit':
			case 'el-attr-layout-margin-right-unit':
			case 'el-attr-layout-margin-left-unit':
			case 'el-attr-layout-padding-right-unit':
			case 'el-attr-layout-padding-left-unit':
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					var css = $(item).IObject('css', style);
					$(item).IObject('css', style, css[0], val);
				});
				break;

			case 'el-attr-layout-lock-resize':
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					if (val == 'unlock') {
						$(item).IObject('setLockResize', false);
					} else {
						$(item).IObject('setLockResize', true);
					}
				});
				break;
			case 'el-attr-layout-lock-move':
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					if (val == 'unlock') {
						$(item).IObject('setLockMove', false);
					} else {
						$(item).IObject('setLockMove', true);
					}
				});
				break;

			default:
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					var css = $(item).IObject('css', style);
					if (css.length == 2) {
						$(item).IObject('css', style, val, css[1]);
					} else {
						$(item).IObject('css', style, val);
					}
				});
				break;
		}
	}
	controlLayoutSetData(style);
}

function controlLayoutSetObject() {
	if (!G_CONTROL_SELECT_OBJECT) {
		controlLayoutResetData();
		return;
	}
	var css = $(G_CONTROL_SELECT_OBJECT).IObject('css');
	$.each(css, controlLayoutSetData);

	controlLayoutSetData('lock-resize');
	controlLayoutSetData('lock-move');

	$('.el-attr .el-attr-layout-datafield').removeAttr('disabled');
}

function controlLayoutResetData() {
	$('.el-attr #el-attr-layout #el-attr-layout-left').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-left-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-top').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-top-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-right').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-right-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-bottom').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-bottom-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-size-x').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-size-x-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-size-y').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-size-y-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-min-size-x').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-min-size-x-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-min-size-y').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-min-size-y-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-max-size-x').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-max-size-x-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-max-size-y').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-max-size-y-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-top').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-top-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-right').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-right-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-bottom').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-bottom-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-left').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-margin-left-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-top').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-top-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-right').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-right-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-bottom').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-bottom-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-left').val('');
	$('.el-attr #el-attr-layout #el-attr-layout-padding-left-unit').val('%');
	$('.el-attr #el-attr-layout #el-attr-layout-overflow-x').val('auto');
	$('.el-attr #el-attr-layout #el-attr-layout-overflow-y').val('auto');
	$('.el-attr #el-attr-layout #el-attr-layout-visibility').val('visible');
	$('.el-attr #el-attr-layout #el-attr-layout-position').val('static');
	$('.el-attr #el-attr-layout #el-attr-layout-display').val('inline-block');
	$('.el-attr #el-attr-layout #el-attr-layout-float').val('none');
	$('.el-attr #el-attr-layout #el-attr-layout-clear').val('none');
	$('.el-attr #el-attr-layout #el-attr-layout-z-index').val('');

	$('.el-attr #el-attr-layout #el-attr-layout-lock-resize').val('unlock');
	$('.el-attr #el-attr-layout #el-attr-layout-lock-move').val('unlock');

	$('.el-attr .el-attr-layout-datafield').attr('disabled', true);
}

// 오브젝트의 값을 가져와서 control영역에 표시
function controlLayoutSetData(key) {
	var val;

	if (!G_CONTROL_SELECT_OBJECT) return;

	if (key == 'lock-resize' || key == 'lock-move') {
		var func;
		switch (key) {
		case 'lock-resize': func = 'getLockResize'; break;
		case 'lock-move': func = 'getLockMove'; break;
		default: return;
		}
		if (G_CONTROL_MULTISELECT) {
			var firstVal = $(G_CONTROL_SELECT_OBJECT[0]).IObject(func);
			var sameVal = true;

			$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
				var nowVal = $(item).IObject(func);
				if (firstVal != nowVal) sameVal = false;
			});
			if (sameVal) {
				val = firstVal;
			} else {
				val = '';
			}
		} else {
			val = $(G_CONTROL_SELECT_OBJECT).IObject(func);
		}
	} else {
		if (G_CONTROL_MULTISELECT) {
			var firstCSS = $(G_CONTROL_SELECT_OBJECT[0]).IObject('css', key);

			if (firstCSS.length == 2) {
				var sameVal = true;
				var sameUnit = true;

				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					var nowCSS = $(item).IObject('css', key);
					if (firstCSS[0] != nowCSS[0]) sameVal = false;
					if (firstCSS[1] != nowCSS[1]) sameUnit = false;
				});
				val = ['', ''];

				if (sameVal) val[0] = firstCSS[0];
				if (sameUnit) val[1] = firstCSS[1];
			} else {
				var sameVal = true;
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					var nowCSS = $(item).IObject('css', key);
					if (firstCSS[0] != nowCSS[0]) sameVal = false;
				});
				if (sameVal) {
					val = [firstCSS[0]];
				} else {
					val = [''];
				}
			}
		} else {
			val = $(G_CONTROL_SELECT_OBJECT).IObject('css', key);
		}
	}
	switch (key) {
		case 'left':
			$('.el-attr #el-attr-layout #el-attr-layout-left').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'top':
			$('.el-attr #el-attr-layout #el-attr-layout-top').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-top-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'right':
			$('.el-attr #el-attr-layout #el-attr-layout-right').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'bottom':
			$('.el-attr #el-attr-layout #el-attr-layout-bottom').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-bottom-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'width':
			$('.el-attr #el-attr-layout #el-attr-layout-size-x').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-size-x-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'height':
			$('.el-attr #el-attr-layout #el-attr-layout-size-y').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-size-y-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'min-width':
			$('.el-attr #el-attr-layout #el-attr-layout-min-size-x').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-min-size-x-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'min-height':
			$('.el-attr #el-attr-layout #el-attr-layout-min-size-y').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-min-size-y-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'max-width':
			$('.el-attr #el-attr-layout #el-attr-layout-max-size-x').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-max-size-x-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'max-height':
			$('.el-attr #el-attr-layout #el-attr-layout-max-size-y').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-max-size-y-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'margin-top':
			$('.el-attr #el-attr-layout #el-attr-layout-margin-top').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-margin-top-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'margin-right':
			$('.el-attr #el-attr-layout #el-attr-layout-margin-right').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-margin-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'margin-bottom':
			$('.el-attr #el-attr-layout #el-attr-layout-margin-bottom').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-margin-bottom-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'margin-left':
			$('.el-attr #el-attr-layout #el-attr-layout-margin-left').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-margin-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'padding-top':
			$('.el-attr #el-attr-layout #el-attr-layout-padding-top').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-padding-top-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'padding-right':
			$('.el-attr #el-attr-layout #el-attr-layout-padding-right').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-padding-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'padding-bottom':
			$('.el-attr #el-attr-layout #el-attr-layout-padding-bottom').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-padding-bottom-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'padding-left':
			$('.el-attr #el-attr-layout #el-attr-layout-padding-left').val(val[0]);
			$('.el-attr #el-attr-layout #el-attr-layout-padding-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'overflow-x':
			$('.el-attr #el-attr-layout #el-attr-layout-overflow-x').val(val[0]);
			break;

		case 'overflow-y':
			$('.el-attr #el-attr-layout #el-attr-layout-overflow-y').val(val[0]);
			break;

		case 'visibility':
			$('.el-attr #el-attr-layout #el-attr-layout-visibility').val(val[0]);
			break;

		case 'position':
			$('.el-attr #el-attr-layout #el-attr-layout-position').val(val[0]);
			break;

		case 'display':
			$('.el-attr #el-attr-layout #el-attr-layout-display').val(val[0]);
			break;

		case 'float':
			$('.el-attr #el-attr-layout #el-attr-layout-float').val(val[0]);
			break;

		case 'clear':
			$('.el-attr #el-attr-layout #el-attr-layout-clear').val(val[0]);
			break;

		case 'z-index':
			$('.el-attr #el-attr-layout #el-attr-layout-z-index').val(val[0]);
			break;

		case 'lock-resize':
			$('.el-attr #el-attr-layout #el-attr-layout-lock-resize').val((val) ? 'lock' : 'unlock');
			break;

		case 'lock-move':
			$('.el-attr #el-attr-layout #el-attr-layout-lock-move').val((val) ? 'lock' : 'unlock');
			break;

		default:
			break;
	}
}
