function toolInit() {
	$('.control-box .el-tool, header .tool').find('.button').on(EVT_MOUSECLICK, function (e) {
		if (G_EDITOR_INFO['mode'] == DOCUMENT_EDITMODE_NONE) return;

		switch ($(this).attr('data-action')) {
			case BTN_TOOL_SELECT:
				toolSet(EDITOR_TOOL_SELECT);
				break;
			case BTN_TOOL_BOX:
				toolSet(EDITOR_TOOL_BOX);
				break;
			case BTN_TOOL_TEXT:
				toolSet(EDITOR_TOOL_TEXT);
				break;
			case BTN_TOOL_IMAGE:
				toolSet(EDITOR_TOOL_IMAGE);
				break;
			case BTN_TOOL_AUDIO:
				toolSet(EDITOR_TOOL_AUDIO);
				break;
			case BTN_TOOL_VIDEO:
				toolSet(EDITOR_TOOL_VIDEO);
				break;
			case BTN_TOOL_DELETE:
				$('.editor .object.selected').each(function (i, obj) {
					$(obj).remove();
				});
				break;
			default:
				break;
		}
	});
	$('.control-box').on(EVT_COLLAPSED, function (e) {
		$('header .logo').addClass('hidden');
		$('header .tool').removeClass('hidden');
	});
	$('.control-box').on(EVT_EXPAND, function (e) {
		$('header .logo').removeClass('hidden');
		$('header .tool').addClass('hidden');
	});
}

function toolSet(tool) {
	var toolbox = $('.control-box .el-tool, header .tool');

	if (!tool) tool = EDITOR_TOOL_SELECT;

	$(toolbox).find('.button.selected').removeClass('selected');

	switch (tool) {
		case EDITOR_TOOL_SELECT:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_SELECT+'"]').addClass('selected');
			break;
		case EDITOR_TOOL_BOX:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_BOX+'"]').addClass('selected');
			break;
		case EDITOR_TOOL_TEXT:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_TEXT+'"]').addClass('selected');
			break;
		case EDITOR_TOOL_IMAGE:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_IMAGE+'"]').addClass('selected');
			break;
		case EDITOR_TOOL_AUDIO:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_AUDIO+'"]').addClass('selected');
			break;
		case EDITOR_TOOL_VIDEO:
			$(toolbox).find('.button[data-action="'+BTN_TOOL_VIDEO+'"]').addClass('selected');
			break;
		default:
			return;
	}
	$('.editor-area').IEditor('setTool', (!tool) ? EDITOR_TOOL_SELECT : tool);
}
