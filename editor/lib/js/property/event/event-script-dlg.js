(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventScriptDlg = function (options) {
		var body, field, select, button;
		var el, self = this;
		var scripts;

		this._options = options;

		body = $('<div></div>').addClass('ia-event-script').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_SCRIPT_NAME']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-script-script').appendTo(field);
		scripts = this.getScriptList();
		$.each(scripts, function (idx, name) {
			$('<option></option>').val(name).html(name + '()').appendTo(select);
		});

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_SCRIPT_REPEAT']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-script-repeat').appendTo(field);
		$('<option></option>').val('no-repeat').html(MESSAGE['IA_EVENT_SCRIPT_REPEAT_NO_REPEAT']).appendTo(select);
		$('<option></option>').val('repeat').html(MESSAGE['IA_EVENT_SCRIPT_REPEAT_REPEAT']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-script-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-script-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 361,
			//height: 75,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_SCRIPT'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-event-script-script').val(options.data.script);
			$(this._el).find('#ia-event-script-repeat').val(options.data.eventRepeat);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var data = self.getData();

			if (action == BTN_OK) {
				if (!data.script) {
					alert(MESSAGE['IA_EVENT_SCRIPT_SCRIPT_NOT_SELECTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventScriptDlg.prototype.getScriptList = function () {
		var scripts = [];
		var data = $('.editor-area').IEditor('getData', 'script');

		if (data.length < 1) return [];

		$.each(data, function (idx, item) {
			if (!item['type']) item['type'] = 'source'; // FIXME!!
			if (item['type'] != 'source') return;
			scripts.push(item['name']);
		});
		return scripts;
	};

	inews.property.event.EventScriptDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.event.EventScriptDlg.prototype.getData = function () {
		return {
			eventRepeat: $(this._el).find('#ia-event-script-repeat').val(),
			script: $(this._el).find('#ia-event-script-script').val()
		};
	};

	inews.property.event.EventScriptDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));