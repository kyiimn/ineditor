(function ($, undefined) {
	$.namespace('inews.property.event');

	inews.property.event.EventTypeDlg = function (options) {
		var body, field, select, button;
		var el, self = this;

		this._options = options;

		body = $('<div></div>').addClass('ia-event-type').addClass('ia-event-dlg');
		if (this._options.id) body.attr('id', this._options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_TYPE_EVENTTYPE']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-type-eventtype').appendTo(field);
		if (!this._options.isDocument) {
			$('<option></option>').val('click').html(MESSAGE['IA_EVENT_TYPE_EVENTTYPE_CLICK']).appendTo(select);
		} else {
			$('<option></option>').val('scroll').html(MESSAGE['IA_EVENT_TYPE_EVENTTYPE_SCROLL']).appendTo(select);
		}
		//$('<option></option>').val('after').html(MESSAGE['IA_EVENT_TYPE_EVENTTYPE_AFTER']).appendTo(select);
		$('<option></option>').val('custom').html(MESSAGE['IA_EVENT_TYPE_EVENTTYPE_CUSTOM']).appendTo(select);

		field = $('<div></div>').addClass('field').addClass('eventtype-option').addClass('hidden').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_TYPE_CUSTOMEVENT']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-type-customevent').attr('type', 'text').appendTo(field);

		field = $('<div></div>').addClass('field').addClass('eventtype-option').addClass('hidden').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_TYPE_POSITION']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-type-position').attr('type', 'text').appendTo(field);

		select = $('<select></select>').attr('id', 'ia-event-type-position-unit').appendTo(field);
		$('<option></option>').val('%').html('%').appendTo(select);
		$('<option></option>').val('px').html('px').appendTo(select);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE']).appendTo(field);
		select = $('<select></select>').attr('id', 'ia-event-type-actiontype').appendTo(field);
		$('<option></option>').val('style').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_STYLE']).appendTo(select);
		if (!this._options.isDocument) {
			$('<option></option>').val('scroll').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_SCROLL']).appendTo(select);
		}
		$('<option></option>').val('link').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_LINK']).appendTo(select);
		$('<option></option>').val('play').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_PLAY']).appendTo(select);
		$('<option></option>').val('fireevent').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_FIREEVENT']).appendTo(select);
		$('<option></option>').val('script').html(MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_SCRIPT']).appendTo(select);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-type-detect').attr('data-action', BTN_DETECT).addClass('hidden').html(MESSAGE['DETECT']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-type-ok').attr('data-action', BTN_OK).html(MESSAGE['OK']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-type-cancel').attr('data-action', BTN_CANCEL).html(MESSAGE['CANCEL']).appendTo(button);

		this.dlg = new inews.Dialog({
			width: 240,
			//height: 82,
			modal: true,
			el: body,
 			title: MESSAGE['IA_EVENT_TYPE'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		if (this._options.data) {
			if (!this._options.data.eventpos) this._options.data.eventpos = [0, '%'];
			$(this._el).find('#ia-event-type-eventtype').val(this._options.data.type);
			$(this._el).find('#ia-event-type-customevent').val(this._options.data.customevent);
			$(this._el).find('#ia-event-type-position').val(this._options.data.eventpos[0]);
			$(this._el).find('#ia-event-type-position-unit').val(this._options.data.eventpos[1]);
			$(this._el).find('#ia-event-type-actiontype').val(this._options.data.actiontype);
		}

		$(this._el).find('#ia-event-type-eventtype').on(EVT_CHANGE, function () {
			var eventtype = $(this).val();
			$(self._el).find('.field.eventtype-option').addClass('hidden');

			switch (eventtype) {
				case 'scroll':
					self._el.find('#ia-event-type-detect').removeClass('hidden');
					self._el.find('.field #ia-event-type-position').parent().removeClass('hidden');
					//self.dlg.height(108);
					break;
				case 'custom':
					self._el.find('#ia-event-type-detect').addClass('hidden');
					self._el.find('.field #ia-event-type-customevent').parent().removeClass('hidden');
					//self.dlg.height(108);
					break;
				default:
					self._el.find('#ia-event-type-detect').addClass('hidden');
					//self.dlg.height(82);
					break;
			}
		});
		$(this._el).find('#ia-event-type-eventtype').trigger(EVT_CHANGE);
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			var data = self.getData();

			if (action == BTN_DETECT) {
				self._detect();
				return;
			} else if (action == BTN_OK) {
				if (data.type == 'scroll' && isNaN(data.eventpos[0])) {
					alert(MESSAGE['IA_EVENT_TYPE_INVALID_SCROLL_POSITION']);
					return;
				}
			}
			self._el.trigger(EVT_BUTTONCLICK, [action]);
			self.close();

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventTypeDlg.prototype._detect = function () {
		var self = this;
		var nowData = this.getData();
		var detectDlg;
		var posPx, orientation;

		orientation = $('.editor-area').IEditor('getOrientation');

		if (!isNaN(parseFloat(nowData.eventpos[0]))) {
			if (nowData.eventpos[1] == '%') {
				if (orientation == ORIENTATION_LANDSCAPE) {
					posPx = ($('.editor-area .editor').height() * (parseFloat(nowData.eventpos[0]) / 100)).toFixed(4);
				} else {
					posPx = ($('.editor-area .editor').width() * (parseFloat(nowData.eventpos[0]) / 100)).toFixed(4);
				}
			} else {
				posPx = nowData.eventpos[0];
			}
		} else {
			posPx = 0;
		}
		detectDlg = new inews.property.event.EventScrollToDetectDlg({
			id: 'ia-event-type-scroll-detect',
			position: posPx
		});
		this.dlg.hide();

		$(detectDlg._el).one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_APPLY) {
				var nowData = self.getData();
				var scrollPos;

				if (orientation == ORIENTATION_LANDSCAPE) {
					scrollPos = $('.editor-area').scrollLeft();
					if (nowData.eventpos[1] == '%') {
						scrollPos = ((scrollPos / $('.editor-area .editor').height()) * 100).toFixed(4);
					}
				} else {
					scrollPos = $('.editor-area').scrollTop();
					if (nowData.eventpos[1] == '%') {
						scrollPos = ((scrollPos / $('.editor-area .editor').width()) * 100).toFixed(4);
					}
				}
				$(self._el).find('#ia-event-type-position').val(scrollPos);
			}
			self.dlg.show();
		});
	};

	inews.property.event.EventTypeDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		$(el).find('#ia-event-type-eventtype').off(EVT_CHANGE);
		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();
	};

	inews.property.event.EventTypeDlg.prototype.getData = function () {
		var el = this.dlg.getEl();
		return {
			type: $(el).find('#ia-event-type-eventtype').val(),
			customevent: $(el).find('#ia-event-type-customevent').val(),
			eventpos: [$(el).find('#ia-event-type-position').val(), $(el).find('#ia-event-type-position-unit').val()],
			actiontype: $(el).find('#ia-event-type-actiontype').val()
		};
	};

	inews.property.event.EventTypeDlg.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));