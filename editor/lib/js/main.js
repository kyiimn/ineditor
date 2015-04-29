var G_MAIN_AUDIOPLAYER_HEIGHT;
var G_MAIN_SCROLLBAR_SIZE;
var G_MAIN_TOUCH_ENABLE;

function _onMainWindowResize(e) {
	var width = $(this).width();
	var height = $(this).height();
	var headerHeight = $('header').height();
	var footerHeight = $('footer').height();
	var controlBoxWidth = $('section .control-box').width();
	var controlElToolHeight = $('section .el-tool').height() + 6 + 6 + 1;
	var propertyBoxWidth = $('section .property-box').width();
	var editorBoxWidth, editorBoxHeight, editorAreaHeight, editorAreaWidth;
	var xSpliterWidth = 0, ySpliterHeight = 0;

	$('section').height(height - ((headerHeight + 2) + (footerHeight + 2) + 2));

	$('section .el-control').height($('section').height() - controlElToolHeight);

	$('section .x-spliter').each(function (idx, el) {
		xSpliterWidth += $(el).width() + 2;
	});
	$('.x-spliter, .y-spliter').each(_onSpliterResize);

	editorBoxWidth = width - ((controlBoxWidth + 1) + (propertyBoxWidth + 1) + xSpliterWidth + 2);
	$('section .editor-box').width(editorBoxWidth);

	$('section .editor-box').trigger(EVT_RESIZE);
	$('section .property-box').trigger(EVT_RESIZE);

	e.preventDefault();
	e.stopPropagation();
}

function mainSetTooltip() {
	$('.function a#btn-func-new').attr('title', MESSAGE['FUNC_NEW']);
	$('.function a#btn-func-open').attr('title', MESSAGE['FUNC_OPEN']);
	$('.function a#btn-func-save').attr('title', MESSAGE['FUNC_SAVE']);
	$('.function a#btn-func-save-as').attr('title', MESSAGE['FUNC_SAVEAS']);
	$('.function a#btn-func-preview').attr('title', MESSAGE['FUNC_PREVIEW']);
	$('.function a#btn-func-delete').attr('title', MESSAGE['FUNC_DELETE']);
	$('.function a#btn-func-publish').attr('title', MESSAGE['FUNC_PUBLISH']);

	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-select"]').attr('title', MESSAGE['TOOL_SELECT']);
	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-box"]').attr('title', MESSAGE['TOOL_BOX']);
	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-text"]').attr('title', MESSAGE['TOOL_TEXT']);
	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-image"]').attr('title', MESSAGE['TOOL_IMAGE']);
	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-audio"]').attr('title', MESSAGE['TOOL_AUDIO']);
	$('.control-box .el-tool, header .tool').find('.button[data-action="tool-video"]').attr('title', MESSAGE['TOOL_VIDEO']);
}

function mainAddFontOption() {
	$.each(G_FONT_LIST, function (idx, val) {
		$('<option></option>').val(val['id']).html(val['name']).appendTo($('select#el-attr-style-font-family'));
	});
}

function mainGetScrollBarSize () {
	var w1, w2;
	var inner, outer;

	if ($('body').hasClass('x-webkit')) {
		G_MAIN_SCROLLBAR_SIZE = 10;
		return;
	}
	inner = document.createElement('p');
	inner.style.width = "100%";
	inner.style.height = "200px";

	outer = document.createElement('div');
	outer.style.position = "absolute";
	outer.style.top = "0px";
	outer.style.left = "0px";
	outer.style.visibility = "hidden";
	outer.style.width = "200px";
	outer.style.height = "150px";
	outer.style.overflow = "hidden";
	outer.appendChild (inner);

	document.body.appendChild (outer);
	w1 = inner.offsetWidth;
	outer.style.overflow = 'scroll';
	w2 = inner.offsetWidth;
	if (w1 == w2) w2 = outer.clientWidth;

	document.body.removeChild (outer);

	G_MAIN_SCROLLBAR_SIZE = (w1 - w2);
}

function mainGetAudioPlayerHeight() {
	var h;

	var inner = document.createElement('audio');
	inner.controls = 'controls';

	var outer = document.createElement('div');
	outer.style.position = "absolute";
	outer.style.top = "0px";
	outer.style.left = "0px";
	outer.style.visibility = "hidden";
	outer.style.width = "300px";
	outer.style.height = "300px";
	outer.style.overflow = "hidden";
	outer.appendChild (inner);

	document.body.appendChild (outer);
	h = inner.offsetHeight;

	document.body.removeChild (outer);

	G_MAIN_AUDIOPLAYER_HEIGHT = h;
}

$(document).ready(function () {
	serverInit();

	$(window).on(EVT_BEFOREUNLOAD, function () {
		if ($('.editor-area *').length < 1) return undefined;
		if (!$('.editor-area').IEditor('getModified')) return undefined;
		return MESSAGE['BROWSER_EXIT'];
	});
	if ($.browser.webkit) {
		$('body').addClass('x-webkit');
	} else if ($.browser.mozilla) {
		$('body').addClass('x-gecko');
	}
	mainGetScrollBarSize();
	mainGetAudioPlayerHeight();

	try {
		document.createEvent("TouchEvent");
		G_MAIN_TOUCH_ENABLE = true;

		EVT_MOUSECLICK = EVT_TOUCHTAP;
		EVT_MOUSEDBLCLICK = EVT_TOUCHDBLTAP;
		EVT_MOUSESTART = EVT_TOUCHDOWN;
		EVT_MOUSESTOP = EVT_TOUCHUP;
		EVT_MOUSEMOVE = EVT_TOUCHMOVE;
		EVT_MOUSEDOWN = EVT_TOUCHDOWN;
		EVT_MOUSEUP = EVT_TOUCHUP;
		EVT_MOUSEOUT = EVT_UNSUPPORTED;

		touchInit();
	} catch (e) {
		G_MAIN_TOUCH_ENABLE = false;
	}
	$(window).on(EVT_RESIZE, _onMainWindowResize);

	$('header').disableSelection();
	$('.control-box').disableSelection();
	$('.property-box').disableSelection();

	$('.control-box .el-attr-box .collapser').on(EVT_MOUSECLICK, function (e) {
		$(this).parent().toggleClass('collapse');
	});
	mainSetTooltip();
	mainAddFontOption();

	spliterInit();
	funcInit();
	toolInit();
	uploadInit();
	editorInit();
	propertyInit();

	docInit();

	dialogInit();

	$(window).trigger(EVT_RESIZE);

	{
		var params = GET_QUERY_PARAMS();
		if (params['id']) {
			_docOpenProc(params['id']);
		}
	}
});