(function ($, undefined) {
	$.namespace('inews.property.script');

	inews.property.script.ScriptLinkDlg = function (options) {
		var body, field, select, button;
		var self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-script-link').addClass('ia-script-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_SCRIPT_LINK_URL']).appendTo(field);
		$('<input></input>').attr('id', 'ia-script-link-url').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-script-link-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-script-link-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 420,
			height: 58,
			modal: true,
			el: body,
			title: MESSAGE['IA_SCRIPT_LINK'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-script-link-url').val(options.data.source);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			switch (action) {
				case BTN_OK:
					if (!$('#ia-script-link-url').val()) {
						alert(MESSAGE['IA_SCRIPT_LINK_URL_IS_NOT_INPUTTED']);
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

	inews.property.script.ScriptLinkDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.script.ScriptLinkDlg.prototype.getData = function () {
		return {
			source: $(this._el).find('#ia-script-link-url').val(),
			name: BASENAME($(this._el).find('#ia-script-link-url').val()),
			type: 'link'
		};
	};

	inews.property.script.ScriptLinkDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));