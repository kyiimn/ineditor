function confirmBox(msg, title, modal, callback, options) {
	new inews.ConfirmBox({
		title: ((title == undefined) ? false : title),
		text: msg,
		modal: ((modal == undefined) ? true : modal),
		callback: ((callback == undefined) ? function () {} : callback),
		options: options
	});
}

(function ($, undefined) {
	$.namespace('inews');

	inews.ConfirmBox = function (options) {
		var body, button;
		var el, self = this;
		var params;

		this._options = options;

		body = $('<div></div>').addClass('confirmbox');
		if (options.id) body.attr('id', options.id);

		$('<div></div>').addClass('text').html(options.text).appendTo(body);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		
		if (this._options.options.buttons) {
			$.each(this._options.options.buttons, function (idx, btn) {
				var btnId = 'confirmbox-custom-btn-' + btn.action;
				$('<button></button>').attr('id', btnId).attr('data-action', btn.action).html(btn.name).appendTo(button);
			});
		} else {
			$('<button></button>').attr('id', 'confirmbox-yes').attr('data-action', BTN_YES).html(MESSAGE['YES']).appendTo(button);
			$('<button></button>').attr('id', 'confirmbox-no').attr('data-action', BTN_NO).html(MESSAGE['NO']).appendTo(button);
		}
		params = {
			width: 'auto',
			height: 'auto',
			modal: ((options.modal) ? true : false),
			el: body,
 			title: ((options.title) ? options.title : MESSAGE['MESSAGE']),
			showCloseBtn: false
		};
		params = $.extend({}, params, this._options.options);

		this.dlg = new inews.Dialog(params);

		this._el = this.dlg.getEl();
		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');
			
			options.callback(e, action);
			
			$(this._el).find('.buttonset button').off(EVT_MOUSECLICK);
			self.dlg.close();
		});
	};
}(jQuery));