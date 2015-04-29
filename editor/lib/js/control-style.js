function _onControlStyleChange(e) {
	if (!G_CONTROL_SELECT_OBJECT) return;

	if (!G_CONTROL_MULTISELECT) {
		var style = $(this).attr('data-style');
		var id = $(this).attr('id');
		var val = $(this).val();
		var css = $(G_CONTROL_SELECT_OBJECT).IObject('css', style);
		var parent = $(G_CONTROL_SELECT_OBJECT).parent();

		switch (id) {
			case 'el-attr-style-border-left-unit':
			case 'el-attr-style-border-right-unit':
			case 'el-attr-style-shadow-width-unit':
			case 'el-attr-style-shadow-bd-unit':
			case 'el-attr-style-transform-translate-x-unit':
				if (css[0] == 'auto' || css[1] != val) {
					if (val == '%' && css[1] == 'px') {
						css[0] = (css[0] / $(parent).width()) * 100;
						css[1] = val;
					} else if (val == 'px' && css[1] == '%') {
						css[0] = $(parent).width() * (css[0] / 100);
						css[1] = val;
					}
					$(G_CONTROL_SELECT_OBJECT).IObject('css', style, css[0], css[1]);
				}
				break;

			case 'el-attr-style-border-top-unit':
			case 'el-attr-style-border-bottom-unit':
			case 'el-attr-style-shadow-height-unit':
			case 'el-attr-style-transform-translate-y-unit':
				if (css[0] == 'auto' || css[1] != val) {
					if (val == '%' && css[1] == 'px') {
						css[0] = (css[0] / $(parent).height()) * 100;
						css[1] = val;
					} else if (val == 'px' && css[1] == '%') {
						css[0] = $(parent).height() * (css[0] / 100);
						css[1] = val;
					}
					$(G_CONTROL_SELECT_OBJECT).IObject('css', style, css[0], css[1]);
				}
				break;

			case 'el-attr-style-background-size-unit':
			case 'el-attr-style-border-radius-top-left-unit':
			case 'el-attr-style-border-radius-bottom-left-unit':
			case 'el-attr-style-border-radius-top-right-unit':
			case 'el-attr-style-border-radius-bottom-right-unit':
			case 'el-attr-style-font-size-unit':
				$(G_CONTROL_SELECT_OBJECT).IObject('css', style, css[0], val);
				break;

			case 'el-attr-style-background-size':
			case 'el-attr-style-font-size':
			case 'el-attr-style-border-top':
			case 'el-attr-style-border-right':
			case 'el-attr-style-border-bottom':
			case 'el-attr-style-border-left':
			case 'el-attr-style-border-radius-top-left':
			case 'el-attr-style-border-radius-top-right':
			case 'el-attr-style-border-radius-bottom-left':
			case 'el-attr-style-border-radius-bottom-right':
			case 'el-attr-style-shadow-width':
			case 'el-attr-style-shadow-height':
			case 'el-attr-style-shadow-bd':
			case 'el-attr-style-transform-rotate':
			case 'el-attr-style-transform-translate-x':
			case 'el-attr-style-transform-translate-y':
			case 'el-attr-style-shadow-bd':
				$(G_CONTROL_SELECT_OBJECT).IObject('css', style, val, css[1]);
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
			case 'el-attr-style-border-left-unit':
			case 'el-attr-style-border-right-unit':
			case 'el-attr-style-shadow-width-unit':
			case 'el-attr-style-shadow-bd-unit':
			case 'el-attr-style-transform-translate-x-unit':
			case 'el-attr-style-border-top-unit':
			case 'el-attr-style-border-bottom-unit':
			case 'el-attr-style-shadow-height-unit':
			case 'el-attr-style-transform-translate-y-unit':
			case 'el-attr-style-background-size-unit':
			case 'el-attr-style-border-radius-top-left-unit':
			case 'el-attr-style-border-radius-bottom-left-unit':
			case 'el-attr-style-border-radius-top-right-unit':
			case 'el-attr-style-border-radius-bottom-right-unit':
			case 'el-attr-style-font-size-unit':
				$(G_CONTROL_SELECT_OBJECT).each(function (idx, item) {
					var css = $(item).IObject('css', style);
					$(item).IObject('css', style, css[0], val);
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
	controlStyleSetData(style);
}

function _onControlStyleClickBackgroundImageSelect(e) {
	var dlg = new inews.dialog.FileBrowserDlg({
		id: 'control-style-bgimage-browser',
		path: FILE_PATH_IMAGE,
		extension: 'png;jpg',
		docid: G_EDITOR_INFO['id'],
		previewImage: true
	});
	$(dlg._el).one(EVT_BUTTONCLICK, function (e, action) {
		var file;

		if (action != BTN_SELECT) return;
		file = dlg.getData();
		$(G_CONTROL_SELECT_OBJECT).IObject('css', 'background-image', file);
		controlStyleSetData('background-image');
	});
}

function _onControlStyleClickBackgroundImageClear(e) {
	$(G_CONTROL_SELECT_OBJECT).IObject('css', 'background-image', '');
	controlStyleSetData('background-image');
}

function controlStyleSetObject() {
	if (!G_CONTROL_SELECT_OBJECT) {
		controlStyleResetData();
		return;
	}
	var css = $(G_CONTROL_SELECT_OBJECT).IObject('css');
	$.each(css, controlStyleSetData);

	$('.el-attr .el-attr-style-datafield').removeAttr('disabled');
}

function controlStyleResetAnimationName() {
	var select = $('.el-attr #el-attr-style #el-attr-style-animation-name');
	var val = select.val();

	select.empty();
	$('<option></option>').val('').html('none').appendTo(select);
	$.each(controlStyleGetAnimationDef(), function (idx, def) {
		$('<option></option>').val(def).html(def).appendTo(select);
	});
	select.val(val);
}

function controlStyleGetAnimationDef() {
	var data, defs = [];

	if ($('.editor-area *').length < 1) return defs;

	data = $('.editor-area').IEditor('getData', 'animation');
	if (data.length < 1) return [];

	$.each(data, function (idx, item) {
		defs.push(item['name']);
	});
	return defs;
}

function controlStyleResetData() {
	$('.el-attr #el-attr-style #el-attr-style-background-image').val('');
	$('.el-attr #el-attr-style #el-attr-style-background-repeat').val('repeat');
	$('.el-attr #el-attr-style #el-attr-style-background-color').val('');
	$('.el-attr #el-attr-style #el-attr-style-background-size').val('');
	$('.el-attr #el-attr-style #el-attr-style-background-size-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-background-attachment').val('scroll');
	$('.el-attr #el-attr-style #el-attr-style-animation-name').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-duration').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-delay').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-timing-function').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-iteration-count').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-direction').val('');
	$('.el-attr #el-attr-style #el-attr-style-animation-play-state').val('');
	$('.el-attr #el-attr-style #el-attr-style-font-family').val('gulim');
	$('.el-attr #el-attr-style #el-attr-style-font-align').val('justify');
	$('.el-attr #el-attr-style #el-attr-style-font-size').val('');
	$('.el-attr #el-attr-style #el-attr-style-font-size-unit').val('pt');
	$('.el-attr #el-attr-style #el-attr-style-font-bold').val('normal');
	$('.el-attr #el-attr-style #el-attr-style-font-italic').val('normal');
	$('.el-attr #el-attr-style #el-attr-style-font-color').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-top').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-top-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-right').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-right-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-bottom').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-bottom-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-left').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-left-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-top-left').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-top-left-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-top-right').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-top-right-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-left').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-left-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-right').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-right-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-border-color').val('');
	$('.el-attr #el-attr-style #el-attr-style-border-style').val('solid');
	$('.el-attr #el-attr-style #el-attr-style-opacity').val('');
	$('.el-attr #el-attr-style #el-attr-style-shadow-width').val('');
	$('.el-attr #el-attr-style #el-attr-style-shadow-width-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-shadow-height').val('');
	$('.el-attr #el-attr-style #el-attr-style-shadow-height-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-shadow-bd').val('');
	$('.el-attr #el-attr-style #el-attr-style-shadow-bd-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-transform-scale-x').val('');
	$('.el-attr #el-attr-style #el-attr-style-transform-scale-y').val('');
	$('.el-attr #el-attr-style #el-attr-style-transform-rotate').val('');
	$('.el-attr #el-attr-style #el-attr-style-transform-rotate-unit').val('deg');
	$('.el-attr #el-attr-style #el-attr-style-transform-translate-x').val('');
	$('.el-attr #el-attr-style #el-attr-style-transform-translate-x-unit').val('%');
	$('.el-attr #el-attr-style #el-attr-style-transform-translate-y').val('');
	$('.el-attr #el-attr-style #el-attr-style-transform-translate-y-unit').val('%');

	$('.el-attr .el-attr-style-datafield').attr('disabled', true);
}

function controlStyleSetData(key) {
	var val;

	if (!G_CONTROL_SELECT_OBJECT) return;

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

	switch (key) {
		case 'background-color':
			$('.el-attr #el-attr-style #el-attr-style-background-color').val(val[0]);
			break;

		case 'background-image':
			$('.el-attr #el-attr-style #el-attr-style-background-image').val(val[0]);
			break;

		case 'background-repeat':
			$('.el-attr #el-attr-style #el-attr-style-background-repeat').val(val[0]);
			break;

		case 'background-size':
			$('.el-attr #el-attr-style #el-attr-style-background-size').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-background-size-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'background-attachment':
			$('.el-attr #el-attr-style #el-attr-style-background-attachment').val(val[0]);
			break;

		case 'font-family':
			$('.el-attr #el-attr-style #el-attr-style-font-family').val(val[0]);
			break;

		case 'text-align':
			$('.el-attr #el-attr-style #el-attr-style-font-align').val(val[0]);
			break;

		case 'font-size':
			$('.el-attr #el-attr-style #el-attr-style-font-size').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-font-size-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'font-weight':
			$('.el-attr #el-attr-style #el-attr-style-font-bold').val(val[0]);
			break;

		case 'font-style':
			$('.el-attr #el-attr-style #el-attr-style-font-italic').val(val[0]);
			break;

		case 'color':
			$('.el-attr #el-attr-style #el-attr-style-font-color').val(val[0]);
			break;

		case 'border-top-width':
			$('.el-attr #el-attr-style #el-attr-style-border-top').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-top-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-right-width':
			$('.el-attr #el-attr-style #el-attr-style-border-right').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-bottom-width':
			$('.el-attr #el-attr-style #el-attr-style-border-bottom').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-bottom-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-left-width':
			$('.el-attr #el-attr-style #el-attr-style-border-left').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-top-left-radius':
			$('.el-attr #el-attr-style #el-attr-style-border-radius-top-left').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-radius-top-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-top-right-radius':
			$('.el-attr #el-attr-style #el-attr-style-border-radius-top-right').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-radius-top-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-bottom-right-radius':
			$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-right').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-right-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-bottom-left-radius':
			$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-left').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-border-radius-bottom-left-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'border-style':
			$('.el-attr #el-attr-style #el-attr-style-border-style').val(val[0]);
			break;

		case 'border-color':
			$('.el-attr #el-attr-style #el-attr-style-border-color').val(val[0]);
			break;

		case 'opacity':
			$('.el-attr #el-attr-style #el-attr-style-opacity').val(val[0]);
			break;

		case 'box-shadow-vertical':
			$('.el-attr #el-attr-style #el-attr-style-shadow-width').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-shadow-width-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'box-shadow-horizontal':
			$('.el-attr #el-attr-style #el-attr-style-shadow-height').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-shadow-height-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'box-shadow-blur':
			$('.el-attr #el-attr-style #el-attr-style-shadow-bd').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-shadow-bd-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '' : val[1]);
			break;

		case 'transform-scale-x':
			$('.el-attr #el-attr-style #el-attr-style-transform-scale-x').val(val[0]);
			break;

		case 'transform-scale-y':
			$('.el-attr #el-attr-style #el-attr-style-transform-scale-y').val(val[0]);
			break;

		case 'transform-rotate':
			$('.el-attr #el-attr-style #el-attr-style-transform-rotate').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-transform-rotate-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '0' : val[1]);
			break;

		case 'transform-translate-x':
			$('.el-attr #el-attr-style #el-attr-style-transform-translate-x').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-transform-translate-x-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '0' : val[1]);
			break;

		case 'transform-translate-y':
			$('.el-attr #el-attr-style #el-attr-style-transform-translate-y').val(val[0]);
			$('.el-attr #el-attr-style #el-attr-style-transform-translate-y-unit').val((isNaN(parseFloat(val[0])) && val[0] != '') ? '0' : val[1]);
			break;

		case 'animation-name':
			$('.el-attr #el-attr-style #el-attr-style-animation-name').val(val[0]);
			break;

		case 'animation-duration':
			$('.el-attr #el-attr-style #el-attr-style-animation-duration').val(val[0]);
			break;

		case 'animation-delay':
			$('.el-attr #el-attr-style #el-attr-style-animation-delay').val(val[0]);
			break;

		case 'animation-timing-function':
			$('.el-attr #el-attr-style #el-attr-style-animation-timing-function').val(val[0]);
			break;

		case 'animation-iteration-count':
			$('.el-attr #el-attr-style #el-attr-style-animation-iteration-count').val(val[0]);
			break;

		case 'animation-direction':
			$('.el-attr #el-attr-style #el-attr-style-animation-direction').val(val[0]);
			break;

		case 'animation-play-state':
			$('.el-attr #el-attr-style #el-attr-style-animation-play-state').val(val[0]);
			break;

		default:
			break;
	}
}
