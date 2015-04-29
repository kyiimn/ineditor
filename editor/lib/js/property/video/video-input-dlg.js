(function ($, undefined) {
	$.namespace('inews.property.video');

	inews.property.video.VideoInputDlg = function (options) {
		var body, field, select, button;
		var self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-video-input').addClass('ia-video-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_VIDEO_INPUT_SITE']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-video-input-site').appendTo(field);
		$.each(inews.property.video.Video.site, function (idx, site) {
			$('<option></option>').val(site.code).html(site.name).appendTo(select);
		});

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_VIDEO_INPUT_TAG']).appendTo(field);
		$('<input></input>').attr('id', 'ia-video-input-url').attr('type', 'text').appendTo(field);

		$('<div></div>').addClass('help').html(MESSAGE['IA_VIDEO_INPUT_HELP']).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-video-input-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-video-input-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 420,
			height: 122,
			modal: true,
			el: body,
			title: MESSAGE['IA_VIDEO_INPUT'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			switch (action) {
				case BTN_OK:
					if (!$('#ia-video-input-url').val()) {
						alert(MESSAGE['IA_VIDEO_INPUT_TAG_IS_NOT_INPUTTED']);
						return false;
					}
					if (!self.getData()) {
						alert(MESSAGE['IA_VIDEO_INPUT_INVALID_VALUE']);
						return false;
					}
					break;

				case BTN_CANCEL:
				default:
					break;
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.video.VideoInputDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.video.VideoInputDlg.prototype.getData = function () {
		var url = $('#ia-video-input-url').val();
		var data, site;

		site = inews.property.video.Video.getSite($('#ia-video-input-site').val());
		data = site.parseURL(url);

		return data;
	};

	inews.property.video.VideoInputDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));