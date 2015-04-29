(function ($, undefined) {
	$.namespace('inews.property.audio');

	inews.property.audio.AudioPropertyDlg = function (options) {
		var body, field, select, button;
		var el, existProperty, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-audio-property').addClass('ia-audio-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_AUDIO_PROPERTY_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-audio-property-name').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_AUDIO_PROPERTY_MIME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-audio-property-type').attr('type', 'text').appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-audio-property-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-audio-property-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 260,
			//height: 78,
			modal: true,
			el: body,
			title: MESSAGE['IA_AUDIO_PROPERTY_MODIFY'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-audio-property-name').attr('disabled', true);
			$(this._el).find('#ia-audio-property-name').val(options.data.name);
			$(this._el).find('#ia-audio-property-type').val(options.data.type);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.audio.AudioPropertyDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.audio.AudioPropertyDlg.prototype.getData = function () {
		return {
			name: this._options.data.name,
			type: $(this._el).find('#ia-audio-property-type').val()
		};
	};

	inews.property.audio.AudioPropertyDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));