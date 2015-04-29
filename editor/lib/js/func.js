function funcInit() {
	$('header .function .button').on(EVT_MOUSECLICK, function (e) {
		var action = $(this).attr('data-action');

		switch (action) {
			case BTN_FUNC_NEW:
				docNew();
				break;
			case BTN_FUNC_OPEN:
				docOpen();
				break;
			case BTN_FUNC_SAVE:
				docSave();
				break;
			case BTN_FUNC_SAVEAS:
				docSaveAs();
				break;
			case BTN_FUNC_PREVIEW:
				docPreview();
				break;
			case BTN_FUNC_DELETE:
				docClose();
				break;
			case BTN_FUNC_PUBLISH:
				docPublish();
				break;
			default:
				break;
		}
	});
}
