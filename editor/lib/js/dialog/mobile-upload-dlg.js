(function ($, undefined) {
	$.namespace('inews.dialog');

	var DEFAULT_OPTIONS = {
		id: false,
		target: false,
		type: false
	};

	inews.dialog.MobileUploadDlg = function (options) {
		var body, field, button;
		var table, thead, tr, div;
		var el, self = this;

		this._options = $.extend({}, DEFAULT_OPTIONS, options);

		var define = G_UPLOAD_DEFINE[this._options.type];
		if (!define) return;

		body = $('<div></div>').addClass('mobile-upload-dlg');
		if (this._options.id) body.attr('id', this._options.id);

		if (define.mobile == 'image') {
			$('<input></input>').attr('id', 'mobile-upload-select').attr('type', 'file').attr('accept', 'image/*').attr('multiple', 'multiple').appendTo(body);
			$('<input></input>').attr('id', 'mobile-upload-camera').attr('type', 'file').attr('accept', 'image/*').attr('capture', 'camera').appendTo(body);

			$('<button></button>').addClass('button').attr('data-action', BTN_UPLOAD_FILE).html(MESSAGE['MOBILE_UPLOAD_SELECT_FILE']).appendTo(body);
			$('<button></button>').addClass('button').attr('data-action', BTN_UPLOAD_CAMERA).html(MESSAGE['MOBILE_UPLOAD_CAPTURE_CAMERA']).appendTo(body);
		} else if (this._options.type == 'audio') {
			$('<input></input>').attr('id', 'mobile-upload-select').attr('type', 'file').attr('accept', 'audio/*').attr('multiple', 'multiple').appendTo(body);

			$('<button></button>').addClass('button').attr('data-action', BTN_UPLOAD_FILE).html(MESSAGE['MOBILE_UPLOAD_SELECT_FILE']).appendTo(body);
		}
		$('<button></button>').addClass('button').attr('data-action', BTN_CLOSE).html(MESSAGE['CLOSE']).appendTo(body);

		this.dlg = new inews.Dialog({
			width: 260,
			modal: true,
			el: body,
 			title: MESSAGE['MOBILE_UPLOAD'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		$(this._el).find('button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			switch (action) {
				case BTN_UPLOAD_FILE:
					$(self._el).find('#mobile-upload-select').trigger('click');
					break;
				case BTN_UPLOAD_CAMERA:
					$(self._el).find('#mobile-upload-camera').trigger('click');
					break;
				case BTN_CLOSE:
				default:
					self.close();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		$(this._el).find('input').on(EVT_CHANGE, function (e) {
			uploadOnDrop(e.target, self._options.target, self._options.type);
			self.close();
		});
	};

	inews.dialog.MobileUploadDlg.prototype.close = function () {
		var el = this.dlg.getEl();

		$(el).find('button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.dialog.MobileUploadDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));