(function ($, undefined) {
	$.namespace('inews.dialog');

	inews.dialog.SaveDocumentDlg = function (options) {
		var body, preview, field, button;
		var div, ul, li;
		var el, self = this;

		this._options = options;

		body = $('<div></div>').addClass('save-doc-dlg');
		if (options.id) body.attr('id', options.id);

		preview = $('<div></div>').addClass('preview').appendTo(body);
		$('<img></img>').attr('src', this._options.preview).appendTo(preview);

		$('<hr></hr>').appendTo(body);

		/*field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['SAVE_DOCUMENT_ID']).appendTo(field);
		$('<input></input>').attr('id', 'save-doc-id').attr('type', 'text').appendTo(field);*/

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['SAVE_DOCUMENT_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'save-doc-name').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['SAVE_DOCUMENT_SCROLL']).appendTo(field);
		$('<input></input>').attr('id', 'save-doc-scroll').attr('type', 'text').attr('disabled', true).appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'save-doc-save').attr('data-action', BTN_SAVE).html(MESSAGE['SAVE']).appendTo(button);
		$('<button></button>').attr('id', 'save-doc-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 330,
			//height: 87,
			modal: true,
			el: body,
 			title: MESSAGE['SAVE_DOCUMENT'],
			showCloseBtn: false
		});
		this._el = this.dlg.getEl();

		//$(this._el).find('#save-doc-id').val((new Date()).format('YmdHis'));
		$(this._el).find('#save-doc-name').val(this._options.name);
		if (this._options.orientation == ORIENTATION_LANDSCAPE) {
			$(this._el).find('#save-doc-scroll').val(MESSAGE['SAVE_DOCUMENT_SCROLL_LANDSCAPE']);
		} else {
			$(this._el).find('#save-doc-scroll').val(MESSAGE['SAVE_DOCUMENT_SCROLL_PORTRAIT']);
		}
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_SAVE) {
				/*if (!$(self._el).find('#save-doc-id').val()) {
					alert(MESSAGE['SAVE_DOCUMENT_ID_IS_NOT_INPUTTED']);
					return;
				}*/
				if (!$(self._el).find('#save-doc-name').val()) {
					alert(MESSAGE['SAVE_DOCUMENT_NAME_IS_NOT_INPUTTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.dialog.SaveDocumentDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.dialog.SaveDocumentDlg.prototype.getData = function () {
		return {
			//id: $(this._el).find('#save-doc-id').val(),
			name: $(this._el).find('#save-doc-name').val()
		};
	};

	inews.dialog.SaveDocumentDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));