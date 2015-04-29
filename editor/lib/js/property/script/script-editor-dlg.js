(function ($, undefined) {
	$.namespace('inews.property.script');

	inews.property.script.ScriptEditorDlg = function (options) {
		var body, field, select, button;
		var el, existProperty, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-script-editor').addClass('ia-script-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_SCRIPT_EDITOR_NAME']).appendTo(field);
		$('<input></input>').attr('id', 'ia-script-editor-name').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<textarea></textarea>').attr('id', 'ia-script-editor-source').appendTo(field);

		$('<div></div>').addClass('help').html(MESSAGE['IA_SCRIPT_EDITOR_HELP']).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-script-editor-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-script-editor-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 600,
			height: 466,
			modal: true,
			el: body,
			title: MESSAGE['IA_SCRIPT_EDITOR'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (options.data) {
			$(this._el).find('#ia-script-editor-name').attr('disabled', true);
			$(this._el).find('#ia-script-editor-name').val(options.data.name);
			$(this._el).find('#ia-script-editor-source').val(options.data.source);
		}

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var data = self.getData();

			if (action == 'BTN_OK') {
				if (!data.name) {
					alert(MESSAGE['IA_SCRIPT_EDITOR_NAME_IS_NOT_INPUTTED']);
					return;
				}
				if (!data.source) {
					alert(MESSAGE['IA_SCRIPT_EDITOR_SOURCE_IS_NOT_INPUTTED']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.script.ScriptEditorDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.script.ScriptEditorDlg.prototype.getData = function () {
		return {
			name: $(this._el).find('#ia-script-editor-name').val(),
			source: $(this._el).find('#ia-script-editor-source').val(),
			type: 'source'
		};
	};

	inews.property.script.ScriptEditorDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));