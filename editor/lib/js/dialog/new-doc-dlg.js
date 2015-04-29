(function ($, undefined) {
	$.namespace('inews.dialog');

	var DOCUMENT_COUNT = 0;

	inews.dialog.NewDocumentDlg = function (id) {
		var body, field, items, item, img, button;
		var el, self = this;

		body = $('<div></div>').addClass('new-doc-dlg');
		if (id) body.attr('id', id);

		field = $('<div></div>').addClass('field').addClass('text').appendTo(body);
		$('<label></label>').html(MESSAGE['NEW_DOCUMENT_TITLE']).appendTo(field);
		$('<input></input>').attr('id', 'new-doc-title').attr('type', 'text').val(MESSAGE['NEW_DOCUMENT_NONAME']+(DOCUMENT_COUNT++)).appendTo(field);

		field = $('<div></div>').addClass('field').addClass('radio').appendTo(body);
		$('<label></label>').html(MESSAGE['NEW_DOCUMENT_ORIENTATION']).appendTo(field);
		items = $('<div></div>').addClass('items').appendTo(field);

		item = $('<div></div>').appendTo(items);
		$('<input></input>').attr('id', 'new-doc-orientation-portrait').attr('name', 'new-doc-orientation').attr('type', 'radio').prop('checked', true).appendTo(item);
		img = $('<img></img>').attr('src', 'images/dialog/new-doc-portrait.png');
		$('<label></label>').attr('for', 'new-doc-orientation-portrait').append(img).appendTo(item);

		item = $('<div></div>').appendTo(items);
		$('<input></input>').attr('id', 'new-doc-orientation-landscape').attr('name', 'new-doc-orientation').attr('type', 'radio').appendTo(item);
		img = $('<img></img>').attr('src', 'images/dialog/new-doc-landscape.png');
		$('<label></label>').attr('for', 'new-doc-orientation-landscape').append(img).appendTo(item);

		field = $('<div></div>').addClass('field').addClass('text').appendTo(body);
		$('<label></label>').html(MESSAGE['NEW_DOCUMENT_RADIO']).appendTo(field);
		select = $('<select></select>').attr('id', 'new-doc-radio-defined').appendTo(field);
		$.each(G_DOC_RADIO, function (idx, data) {
			$('<option></option>').val(data.value).html(data.name).appendTo(select);
		});
		$('<option></option>').val('free').html(MESSAGE['NEW_DOCUMENT_RATIO_FREE']).prop('selected', true).appendTo(select);
		$('<option></option>').val('').html(MESSAGE['NEW_DOCUMENT_RATIO_CUSTOM']).appendTo(select);

		field = $('<div></div>').addClass('field').addClass('text').appendTo(body);
		$('<label></label>').html('&nbsp;').appendTo(field);
		$('<input></input>').attr('id', 'new-doc-radio').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(field);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'new-doc-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'new-doc-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 330,
			//height: 190,
			modal: true,
			el: body,
 			title: MESSAGE['NEW_DOCUMENT'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		$(this._el).find('#new-doc-radio-defined').on(EVT_CHANGE, function (e) {
			var val = $(this).val();

			if (val == '') {
				$(self._el).find('#new-doc-radio').removeAttr('disabled');
			} else {
				$(self._el).find('#new-doc-radio').attr('disabled', true);
			}
			$(self._el).find('#new-doc-radio').val(val);
		});
		$(this._el).find('#new-doc-radio-defined').trigger(EVT_CHANGE);
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#new-doc-title').val()) {
					alert(MESSAGE['NEW_DOCUMENT_MUST_INPUT_TITLE']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.dialog.NewDocumentDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.dialog.NewDocumentDlg.prototype.getData = function () {
		var el = this.dlg.getEl();
		var ratio = $(el).find('#new-doc-radio').val();

		return {
			title: $(el).find('#new-doc-title').val(),
			orientation: (($(el).find('#new-doc-orientation-landscape'))[0].checked) ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT,
			ratio: (ratio == '') ? 'free' : ratio
		};
	};

	inews.dialog.NewDocumentDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));