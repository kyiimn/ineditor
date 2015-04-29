var G_EDITOR_OBJECT_EVENT_MOVE_SKIPPER = 0;
var G_EDITOR_OBJECT_EVENT_RESIZE_SKIPPER = 0;
var G_EDITOR_OBJECT_EVENT_ROTATE_SKIPPER = 0;
var G_EDITOR_TRANSLATE_MOVE = false;

var G_EDITOR_INFO = {
	id: '',
	title: '',
	mode: DOCUMENT_EDITMODE_NONE,
	orientation: '',
	ratio: ''
};

// ruler 표시
function _onEditorCustomMouseMove(editorpos, objpos) {
	editorRulerMove(editorpos[0], editorpos[1]);
}

function _onEditorCustomMouseOut() {
	editorRulerHide();
}

function _onEditorBoxResize(e) {
	var editorBoxWidth = $(this).width();
	var editorBoxHeight = $(this).height();
	var editorAreaWidth, editorAreaHeight;
	var editorBlankWidth, editorBlankHeight;

	editorAreaWidth = editorBoxWidth;
	editorAreaHeight = editorBoxHeight;

	do {
		var ratio, ratioXY, ratioX, ratioY;
		var scrollX, scrollY, t;

		ratio = G_EDITOR_INFO['ratio'];
		if (ratio == '') break;

		ratioXY = ratio.split(':');
		if (ratioXY.length != 2) break;

		ratioX = parseFloat(ratioXY[0]);
		ratioY = parseFloat(ratioXY[1]);

		if (isNaN(ratioX) || isNaN(ratioY)) break;

		if (G_EDITOR_INFO['orientation'] == ORIENTATION_LANDSCAPE) {
			scrollX = G_MAIN_SCROLLBAR_SIZE;
			scrollY = 0;
		} else {
			scrollX = 0;
			scrollY = G_MAIN_SCROLLBAR_SIZE;
		}

		t = ratioY / ratioX;
		editorAreaWidth = Math.round((editorBoxHeight - scrollX) / t) + scrollY;
		editorAreaHeight = Math.round((editorBoxHeight));

		if (editorAreaWidth > editorBoxWidth) {
			t = ratioX / ratioY;
			editorAreaWidth = Math.round((editorBoxWidth));
			editorAreaHeight = Math.round((editorBoxWidth - scrollY) / t) + scrollX;
		}
	} while (false);

	editorBlankWidth = editorBoxWidth - editorAreaWidth;
	editorBlankHeight = editorBoxHeight - editorAreaHeight;

	$('section .editor-blank-x').width(editorBlankWidth);
	$('section .editor-blank-y').height(editorBlankHeight);

	$('section .editor-area').width(editorAreaWidth);
	$('section .editor-area').height(editorAreaHeight);

	e.preventDefault();
	e.stopPropagation();

	$('.editor-area .object').trigger(EVT_EDITORRESIZE);
}

function editorInit() {
	$('section .editor-box').on(EVT_RESIZE, _onEditorBoxResize);

	controlInit();

	// 편집기에서 객체 선택시 Control영역에 스타일등 표시
	$(document).on(EVENT(EVT_SELECT, EVT_UNSELECT), '.editor-area .object', function (e) {
		controlSetObject();
		editorUpdateStatus();
	});

	$(document).on(EVT_DOCUMENT_UPDATE, function (e) {
		editorUpdateStatus();
	});

	// 객체 이동/크기변경시 Control영역에 해당값 바로반영
	// SKIPPER : 이벤트를 5번받으면 한번만 적용
	$(document).on(EVENT(EVT_MOVE, EVT_MOVING), '.editor-area .object.selected', function (e) {
		var layoutKeys = ['left', 'top', 'bottom', 'right'];
		var styleKeys = ['transform-translate-x', 'transform-translate-y'];
		var obj = $(this);
		G_EDITOR_OBJECT_EVENT_MOVE_SKIPPER = INC_MOD(G_EDITOR_OBJECT_EVENT_MOVE_SKIPPER, 5);
		if (G_EDITOR_OBJECT_EVENT_MOVE_SKIPPER != 0 && e.type == EVT_MOVING) return;
		$.each(layoutKeys, function (idx, item) { controlLayoutSetData(item); });
		$.each(styleKeys, function (idx, item) { controlStyleSetData(item); });
	});
	$(document).on(EVENT(EVT_RESIZE, EVT_RESIZING), '.editor-area .object.selected', function (e) {
		var keys = ['left', 'top', 'bottom', 'right', 'width', 'height'], obj = $(this);
		G_EDITOR_OBJECT_EVENT_RESIZE_SKIPPER = INC_MOD(G_EDITOR_OBJECT_EVENT_RESIZE_SKIPPER, 5);
		if (G_EDITOR_OBJECT_EVENT_RESIZE_SKIPPER != 0 && e.type == EVT_RESIZING) return;
		$.each(keys, function (idx, item) { controlLayoutSetData(item); });
	});
	$(document).on(EVENT(EVT_ROTATE, EVT_ROTATING), '.editor-area .object.selected', function (e) {
		var keys = ['transform-rotate'], obj = $(this);
		G_EDITOR_OBJECT_EVENT_ROTATE_SKIPPER = INC_MOD(G_EDITOR_OBJECT_EVENT_ROTATE_SKIPPER, 5);
		if (G_EDITOR_OBJECT_EVENT_ROTATE_SKIPPER != 0 && e.type == EVT_ROTATING) return;
		$.each(keys, function (idx, item) { controlStyleSetData(item); });
	});
	$(document).on(EVT_STYLECHANGE, '.editor-area .object.selected', function (e) {
		var keys = ['background-image'], obj = $(this);
		$.each(keys, function (idx, item) { controlStyleSetData(item); });
	});
	$('footer .status').on(EVT_MOUSECLICK, '> *', function (e) {
		var uid = $(this).attr('data-uid');
		var type = $(this).attr('data-type');

		if (type == 'body') {
			$('.editor-area').IEditor('unselect');
		} else {
			$('.editor-area').IEditor('select', $('.editor .object[data-uid="'+uid+'"]'));
		}
	});
}

function editorOpen(options) {
	G_EDITOR_INFO['id'] = options.id;
	G_EDITOR_INFO['title'] = options.title;
	G_EDITOR_INFO['orientation'] = options.orientation;
	G_EDITOR_INFO['mode'] = options.mode;
	G_EDITOR_INFO['ratio'] = options.ratio;

	$('section .editor-box').trigger(EVT_RESIZE);

	docEditorInfoApply();

	if ($('.editor-area *').length > 0) {
		$('.editor-area').IEditor('destroy');
	}
	$('.editor-area').IEditor({
		orientation: G_EDITOR_INFO['orientation'],

		style: options.css,
		data: options.data
		//onCustomMouseMove: _onEditorCustomMouseMove,
		//onCustomMouseOut: _onEditorCustomMouseOut
	});
	$('.editor-area').on(EVT_DRAWEND, function (e) {
		toolSet(EDITOR_TOOL_SELECT);

		e.preventDefault();
		e.stopPropagation();
	});
}

function editorUpdate(options) {
	G_EDITOR_INFO['id'] = options.id;
	G_EDITOR_INFO['title'] = options.title;
	G_EDITOR_INFO['orientation'] = options.orientation;
	G_EDITOR_INFO['mode'] = options.mode;
	G_EDITOR_INFO['ratio'] = options.ratio;

	$('section .editor-box').trigger(EVT_RESIZE);

	docEditorInfoApply();
}

function editorClose() {
	$('.editor-area').IEditor('destroy');

	G_EDITOR_INFO['id'] = '';
	G_EDITOR_INFO['title'] = '';
	G_EDITOR_INFO['orientation'] = '';
	G_EDITOR_INFO['mode'] = DOCUMENT_EDITMODE_NONE;
	G_EDITOR_INFO['ratio'] = '';

	$('section .editor-box').trigger(EVT_RESIZE);

	docEditorInfoApply();
}

function editorGetData(parent) {
	var datas = [];

	$(parent).find(' > .object').each(function (idx, obj) {
		var objData = {};
		objData.id = $(obj).IObject('id');
		objData.type = $(obj).IObject('getType');
		objData.css = $(obj).IObject('css');
		objData.data = $(obj).IObject('getData');
		objData.lockMove = $(obj).IObject('getLockMove');
		objData.lockResize = $(obj).IObject('getLockResize');

		if (objData.type == OBJECT_TYPE_BOX) {
			objData.items = editorGetData(obj);
		}
		datas.push(objData);
	});
	return datas;
}

function editorSetData(parent, data) {
	var editor = $('.editor-area').data('inews-IEditor');

	$.each(data, function (idx, objData) {
		var obj = $('<div></div>').appendTo($(parent));
		$(obj).IObject({
			id: objData.id,
			type: objData.type,
			editor: editor,
			style: objData.css,
			data: objData.data
		});
/*		obj.IObject('id', objData.id);

		$.each(objData.css, function (key, val) {
			if (val.length > 1) {
				obj.IObject('css', key, val[0], val[1]);
			} else {
				obj.IObject('css', key, val[0]);
			}
		});

		$.each(objData.data, function (key, val) {
			obj.IObject('setData', key, val);
		});
*/
		if (objData.type == OBJECT_TYPE_BOX) {
			editorSetData(obj, objData.items);
		}
		obj.trigger(EVT_REDRAW);
	});
}

function editorRulerMove(x, y) {
	var rulerX = $('.editor-ruler-x .editor-ruler-arrow');
	var rulerY = $('.editor-ruler-y .editor-ruler-arrow');

	rulerX.css({
		'visibility': 'visible',
		'margin-left': x
	});
	rulerY.css({
		'visibility': 'visible',
		'margin-top': y
	});
}

function editorRulerHide() {
	var rulerX = $('.editor-ruler-x .editor-ruler-arrow');
	var rulerY = $('.editor-ruler-y .editor-ruler-arrow');

	rulerX.css({
		'visibility': 'hidden',
		'margin-left': 0
	});
	rulerY.css({
		'visibility': 'hidden',
		'margin-top': 0
	});
}

function editorSetTranslateMove(val) {
	G_EDITOR_TRANSLATE_MOVE = val;
}

function editorGetTranslateMove() {
	return G_EDITOR_TRANSLATE_MOVE;
}

function editorUpdateStatus() {
	var selected = $('.editor-area .object.selected');
	var status = $('footer .status');

	status.empty();

	if (selected.length == 1) {
		$.each($(selected).IObject('getPath'), function (i, obj) {
			var span = $('<span></span>');

			if (i == 0) span.addClass('light');

			span.addClass('link');
			span.attr('data-uid', obj.uid);
			span.attr('data-type', obj.type);
			span.html(SPRINTF('%s%s', obj.type, ((obj.id) ? '#'+obj.id : '')));
			span.prependTo(status);

			if (obj.type != 'body') $('<span></span>').html('>').prependTo(status);
		});
	}
}
