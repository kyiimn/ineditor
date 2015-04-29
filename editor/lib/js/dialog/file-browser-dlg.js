(function ($, undefined) {
	$.namespace('inews.dialog');

	var DEFAULT_OPTIONS = {
		id: false,
		path: FILE_PATH_DATA,
		extension: '*',
		docid: '',
		previewImage: false
	};

	inews.dialog.FileBrowserDlg = function (options) {
		var body, field, button;
		var table, thead, tr, div;
		var el, self = this;

		this._options = $.extend({}, DEFAULT_OPTIONS, options);

		body = $('<div></div>').addClass('file-browser-dlg');
		if (this._options.id) body.attr('id', this._options.id);

		leftSide = $('<div></div>').addClass('left-side').addClass('side').appendTo(body);

		field = $('<div></div>').addClass('field').addClass('text').appendTo(leftSide);
		$('<label></label>').html(MESSAGE['FILE_BROWSER_PATH']).appendTo(field);
		$('<input></input>').attr('id', 'file-browser-path').attr('type', 'text').attr('disabled', true).appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(leftSide);
		table = $('<table></table>').addClass('file-browser-header').width(430).appendTo(field);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['FILE_BROWSER_LIST_NAME']).appendTo(tr);
		$('<th></th>').html(MESSAGE['FILE_BROWSER_LIST_DATE']).appendTo(tr);
		$('<th></th>').html(MESSAGE['FILE_BROWSER_LIST_SIZE']).appendTo(tr);

		div = $('<div></div>').addClass('file-browser-list-scroll').appendTo(field);
		table = $('<table></table>').addClass('file-browser-list').width(430 - G_MAIN_SCROLLBAR_SIZE - 2).appendTo(div);
		$('<tbody></tbody>').appendTo(table);

		if (this._options.previewImage) {
			rightSide = $('<div></div>').addClass('right-side').addClass('side').appendTo(body);
			$('<div></div>').addClass('file-browser-preview').appendTo(rightSide);
		}
		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'file-browser-select').attr('data-action', BTN_SELECT).html(MESSAGE['SELECT']).appendTo(button);
		$('<button></button>').attr('id', 'file-browser-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: this._options.previewImage ? 637 : 430,
			//height: 330,
			modal: true,
			el: body,
 			title: MESSAGE['FILE_BROWSER'],
			showCloseBtn: false
		});
		this._loadFileList();

		this._el = this.dlg.getEl();
		$(this._el).on(EVT_MOUSECLICK, '.file-browser-list tbody tr', function (e) {
			$(self._el).find('.file-browser-list tbody tr').removeClass('selected');
			$(this).addClass('selected');

			if (self._options.previewImage) {
				self._preview();
			}
			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).on(EVT_MOUSEDBLCLICK, '.file-browser-list tbody tr', function (e) {
			$(self._el).find('.file-browser-list tbody tr').removeClass('selected');
			$(this).addClass('selected');

			if (self._options.previewImage) {
				self._preview();
			}
			$(self._el).find('.buttonset button#file-browser-select').trigger(EVT_MOUSECLICK);

			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_SELECT) {
				if ($(self._el).find('.file-browser-list tr.selected').length < 1) {
					alert(MESSAGE['FILE_BROWSER_LIST_IS_NOT_SELECTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.dialog.FileBrowserDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).off(EVT_MOUSECLICK, '.file-browser-list tbody tr');
		$(el).off(EVT_MOUSEDBLCLICK, '.file-browser-list tbody tr');

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.dialog.FileBrowserDlg.prototype._loadFileList = function () {
		var self = this;

		waitbarShow();
		$.ajax({
			data: {
				fn: 'load_list',
				session: G_SERVER_SESSION,
				user: G_SERVER_USERID,
				path: this._options.path,
				extension: this._options.extension,
				docid: this._options.docid
			},
			type: 'POST',
			url: 'app/file.php',
			success: function (response) {
				waitbarHide();
				if (!response.success) {
					alert(MESSAGEERR[response.msg]);
					return;
				}
				$(self._el).find('#file-browser-path').val(response.data.path);
				$.each(response.data.list, function (idx, val) {
					var li = $('<tr></tr>').attr('title', val.name).data('file', val.name).disableSelection();
					$('<td></td>').html(val.name).appendTo(li);
					$('<td></td>').html(val.date).appendTo(li);
					$('<td></td>').html(val.size).css('width', 89 - 1 - G_MAIN_SCROLLBAR_SIZE).appendTo(li);
					$(self._el).find('.file-browser-list tbody').append(li);
				});
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGEERR['SERV0001']);
			}
		});
	};

	inews.dialog.FileBrowserDlg.prototype._preview = function () {
		var preview = $(this._el).find('.file-browser-preview');
		var selected = $(this._el).find('.file-browser-list tr.selected');
		var img;

		preview.empty();

		if (!selected.length) return;

		img = $('<img></img>');
		img.appendTo(preview);

		img.load(function () {
			var imgH, previewH;

			$(this).data('loaded', true);
			imgH = $(this).height();
			previewH = $(this).parent().height();

			if (previewH > imgH) {
				$(this).css('margin-top', Math.floor((previewH - imgH) / 2));
			} else {
				$(this).css('margin-top', 0);
			}
		});
		img.attr('src', pathGetImage(selected.data('file')));
	};

	inews.dialog.FileBrowserDlg.prototype.getData = function () {
		return $(this._el).find('.file-browser-list tr.selected').data('file');
	};

	inews.dialog.FileBrowserDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));