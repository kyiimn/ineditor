function messageBox(msg, title, modal, callback, options) {
	new inews.MessageBox({
		title: ((title == undefined) ? false : title),
		text: msg,
		modal: ((modal == undefined) ? true : modal),
		callback: ((callback == undefined) ? function () {} : callback),
		options: options
	});
}

(function ($, undefined) {
	$.namespace('inews');

	inews.MessageBox = function (options) {
		var body, button;
		var el, self = this;
		var params;

		this._options = options;

		body = $('<div></div>').addClass('messagebox');
		if (options.id) body.attr('id', options.id);

		$('<div></div>').addClass('text').html(options.text).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'messagebox-ok').html(MESSAGE['OK']).appendTo(button);

		params = {
			width: 'auto',
			height: 'auto',
			modal: ((options.modal) ? true : false),
			el: body,
 			title: ((options.title) ? options.title : MESSAGE['MESSAGE']),
			showCloseBtn: true
		};
		params = $.extend({}, params, this._options.options);

		this.dlg = new inews.Dialog(params);

		this._el = this.dlg.getEl();
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			$(self._el).find('.buttonset button').off(EVT_MOUSECLICK);
			self.dlg.close();
		});
		$(this._el).one(EVT_CLOSE, options.callback);
	};
}(jQuery));