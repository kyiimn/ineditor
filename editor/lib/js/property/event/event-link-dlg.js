(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventLinkDlg = function (options) {
		var body, field, button;
		var el, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-event-link').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_LINK_URL']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-link-url').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_LINK_REPEAT']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-link-repeat').appendTo(field);
		$('<option></option>').val('no-repeat').html(MESSAGE['IA_EVENT_LINK_REPEAT_NO_REPEAT']).appendTo(select);
		$('<option></option>').val('repeat').html(MESSAGE['IA_EVENT_LINK_REPEAT_REPEAT']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-link-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-link-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 361,
			//height: 82,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_LINK'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-event-link-url').val(options.data.url);
			$(this._el).find('#ia-event-link-repeat').val(options.data.eventRepeat);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			if (action == BTN_OK) {
				if (!$(self._el).find('#ia-event-link-url').val()) {
					alert(MESSAGE['IA_EVENT_LINK_URL_IS_NOT_INPUTTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventLinkDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.event.EventLinkDlg.prototype.getData = function () {
		return {
			eventRepeat: $(this._el).find('#ia-event-link-repeat').val(),
			url: $(this._el).find('#ia-event-link-url').val()
		};
	};

	inews.property.event.EventLinkDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));