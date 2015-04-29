(function ($, undefined) {
	$.namespace('inews.dialog');

	inews.dialog.OpenDocumentDlg = function (id) {
		var body, field, button;
		var table, thead, tr, div;
		var el, self = this;

		body = $('<div></div>').addClass('open-doc-dlg');
		if (id) body.attr('id', id);

		leftSide = $('<div></div>').addClass('left-side').addClass('side').appendTo(body);

		field = $('<div></div>').addClass('field').appendTo(leftSide);
		table = $('<table></table>').addClass('open-doc-header').width(360).appendTo(field);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['OPEN_DOCUMENT_LIST_NAME']).appendTo(tr);
		$('<th></th>').html(MESSAGE['OPEN_DOCUMENT_LIST_DATE']).appendTo(tr);
		$('<th></th>').html(MESSAGE['OPEN_DOCUMENT_LIST_SCROLL']).appendTo(tr);

		div = $('<div></div>').addClass('open-doc-list-scroll').appendTo(field);
		table = $('<table></table>').addClass('open-doc-list').width(360 - G_MAIN_SCROLLBAR_SIZE - 2).appendTo(div);
		$('<tbody></tbody>').appendTo(table);

		rightSide = $('<div></div>').addClass('right-side').addClass('side').appendTo(body);
		$('<div></div>').addClass('open-doc-preview').appendTo(rightSide);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'open-doc-select').attr('data-action', BTN_SELECT).html(MESSAGE['SELECT']).appendTo(button);
		$('<button></button>').attr('id', 'open-doc-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 695,
			//height: 302,
			modal: true,
			el: body,
 			title: MESSAGE['OPEN_DOCUMENT'],
			showCloseBtn: false
		});
		this._loadDocList();

		this._el = this.dlg.getEl();
		$(this._el).on(EVT_MOUSECLICK, '.open-doc-list tbody tr', function (e) {
			$(self._el).find('.open-doc-list tbody tr').removeClass('selected');
			$(this).addClass('selected');

			self._preview();

			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).on(EVT_MOUSEDBLCLICK, '.open-doc-list tbody tr', function (e) {
			$(self._el).find('.open-doc-list tbody tr').removeClass('selected');
			$(this).addClass('selected');

			self._preview();

			$(self._el).find('.buttonset button#open-doc-select').trigger(EVT_MOUSECLICK);

			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_SELECT) {
				if ($(self._el).find('.open-doc-list tr.selected').length < 1) {
					alert(MESSAGE['OPEN_DOCUMENT_LIST_IS_NOT_SELECTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.dialog.OpenDocumentDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).off(EVT_MOUSECLICK, '.open-doc-list tbody tr');
		$(el).off(EVT_MOUSEDBLCLICK, '.open-doc-list tbody tr');

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.dialog.OpenDocumentDlg.prototype._loadDocList = function () {
		var self = this;

		waitbarShow();
		$.ajax({
			data: {
				fn: 'load_list',
				session: G_SERVER_SESSION,
				user: G_SERVER_USERID
			},
			type: 'POST',
			url: 'app/doc.php',
			success: function (response) {
				waitbarHide();
				if (!response.success) {
					alert(MESSAGEERR[response.msg]);
					return;
				}
				$.each(response.data.list, function (idx, val) {
					var li, span;

					li = $('<tr></tr>');
					li.attr('title', val.name);
					li.data('id', val.id);
					li.data('preview', val.preview);
					li.data('orientation', val.orientation);
					li.disableSelection();

					$('<td></td>').html(val.name).appendTo(li);
					$('<td></td>').html(val.date).appendTo(li);
					span = $('<td></td>').css('width', 89 - G_MAIN_SCROLLBAR_SIZE).appendTo(li);

					if (val.orientation == ORIENTATION_LANDSCAPE) {
						span.html(MESSAGE['OPEN_DOCUMENT_LIST_SCROLL_LANDSCAPE']);
					} else {
						span.html(MESSAGE['OPEN_DOCUMENT_LIST_SCROLL_PORTRAIT']);
					}
					$(self._el).find('.open-doc-list tbody').append(li);
				});
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGEERR['SERV0001']);
			}
		});
	};

	inews.dialog.OpenDocumentDlg.prototype._preview = function () {
		var preview = $(this._el).find('.open-doc-preview');
		var selected = $(this._el).find('.open-doc-list tr.selected');
		var img;

		preview.empty();
		preview.removeClass('landscape');
		preview.removeClass('portrait');

		if (!selected.length) return;
		if (!selected.data('preview')) return;

		preview.addClass(selected.data('orientation'));

		img = $('<img></img>');
		img.attr('src', selected.data('preview'));
		img.appendTo(preview);
	};

	inews.dialog.OpenDocumentDlg.prototype.getData = function () {
		return $(this._el).find('.open-doc-list tr.selected').data('id');
	};

	inews.dialog.OpenDocumentDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));