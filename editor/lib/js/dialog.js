function dialogInit() {
	inews.Dialog.Init();
}

(function ($, undefined) {
	$.namespace('inews');

	var DLG_DEFAULT_OPTIONS = {
		width: 200,
		height: 'auto',
		left: -1,
		top: -1,
		right: -1,
		bottom: -1,
		modal: true,
		el: false,
		title: 'Dialog',
		showCloseBtn: true,
		showTitleBar: true
	};
	var DLG_MOVE = false;
	var DLG_BEFORE_X, DLG_BEFORE_Y, DLG_OBJ;

	inews.Dialog = function (options) {
		var ts = (new Date()).getTime();
		var titlebar, closeBtn;
		var self = this;

		this._options = $.extend({}, DLG_DEFAULT_OPTIONS, options);
		this._el = this._options.el;
		this._el.addClass('dlg-content');
		this._el.data('dlg', this);

		this._dlgId = 'dlg' + '_' + ts;

		if (!this._el) {
			return;
		}
		if ($(this._el).attr('id')) {
			this._dlgId = 'dlg' + '_' + $(this._el).attr('id');
		}
		if (this._options.modal) {
			$('<div></div>').addClass('dlg-modal').attr('id', 'modal-'+this._dlgId).appendTo($('body'));
		}

		this._dlgEl = $('<div></div>').appendTo($('body'));
		this._dlgEl.attr('id', this._dlgId);
		this._dlgEl.addClass('dlg');

		/*this._dlgEl.on(EVT_RESIZE, function (e) {
			self.center();
		});*/

		if (this._options.showTitleBar) {
			titlebar = $('<div></div>').addClass('dlg-titlebar').appendTo(this._dlgEl);
			$('<span></span>').html(this._options.title).appendTo(titlebar);

			$(this._dlgEl).find('.dlg-titlebar').on(EVT_MOUSEDOWN, function (e) {
				CHECK_TOUCH(e);

				$('<div></div>').addClass('dlg-movearea').appendTo('body');

				DLG_MOVE = true;
				DLG_OBJ = self._dlgEl;
				DLG_BEFORE_X = e.pageX;
				DLG_BEFORE_Y = e.pageY;

				e.preventDefault();
				e.stopPropagation();
			});

			if (this._options.showCloseBtn) {
				$('<a></a>').addClass('dlg-titlebar-close').appendTo(titlebar);
				this._dlgEl.find('.dlg-titlebar-close').on(EVT_MOUSECLICK, function (e) {
					self.close();
				});
			}
		}
		$('<div></div>').addClass('dlg-body').appendTo(this._dlgEl);

		this.center();
		this._el.trigger(EVT_OPEN);

		$($(this._dlgEl).find('input,select').get(0)).focus();
	};

	inews.Dialog.Init = function () {
		$(document).on(EVT_MOUSEMOVE, '.dlg-movearea', function (e) {
			var screenWidth, screenHeight, popupWidth, popupHeight;
			var nowX, nowY, moveX, moveY, limitX, limitY, targetX, targetY;
			var dlgPos;

			if (!DLG_MOVE) return;

			CHECK_TOUCH(e);

			screenWidth = $(window).width();
			screenHeight = $(window).height();
			popupWidth = $(DLG_OBJ).width();
			popupHeight = $(DLG_OBJ).height();
			dlgPos = $(DLG_OBJ).position();
			nowX = dlgPos.left;//parseInt($(DLG_OBJ).css('left'));
			nowY = dlgPos.top;//parseInt($(DLG_OBJ).css('top'));
			moveX = e.pageX - DLG_BEFORE_X;
			moveY = e.pageY - DLG_BEFORE_Y;
			limitX = screenWidth - popupWidth;
			limitY = screenHeight - popupHeight;

			targetX = nowX + moveX;
			targetY = nowY + moveY;

			if (targetX < 0) $(DLG_OBJ).css('left', 0);
			else if (targetX > limitX) $(DLG_OBJ).css('left', limitX);
			else $(DLG_OBJ).css('left', targetX);

			if (targetY < 0) $(DLG_OBJ).css('top', 0);
			else if (targetY > limitY) $(DLG_OBJ).css('top', limitY);
			else $(DLG_OBJ).css('top', targetY);

			$(DLG_OBJ).css('right', 'initial');
			$(DLG_OBJ).css('bottom', 'initial');

			DLG_BEFORE_X = e.pageX;
			DLG_BEFORE_Y = e.pageY;

			e.preventDefault();
			e.stopPropagation();
		});

		$(document).on(EVT_MOUSEUP, '.dlg-movearea', function (e) {
			$('.dlg-movearea').remove();

			if (!DLG_MOVE) return;
			DLG_MOVE = false;

			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.Dialog.prototype.close = function () {
		if (this._options.showTitleBar) {
			this._dlgEl.find('.dlg-titlebar').off(EVT_MOUSEDOWN);
			this._dlgEl.find('.dlg-titlebar').off(EVT_MOUSEUP);

			if (this._options.showCloseBtn) {
				this._dlgEl.find('.dlg-titlebar-close').off(EVT_MOUSECLICK);
			}
		}
		this._el.trigger(EVT_CLOSE);

		this._dlgEl.off(EVT_RESIZE);
		this._dlgEl.find('.dlg-titlebar-close').off(EVT_MOUSECLICK);
		this._dlgEl.remove();

		$('.dlg-modal#modal-'+this._dlgId).remove();
	};

	inews.Dialog.prototype.center = function () {
		var screenWidth = $(window).width();
		var screenHeight = $(window).height();

		this._dlgEl.find('.dlg-body').width(this._options.width);
		this._dlgEl.find('.dlg-body').height(this._options.height);

		this._dlgEl.find('.dlg-body').append($(this._el));

		if (this._options.left < 0 && this._options.right < 0) {
			if (isNaN(parseInt(this._options.width))) {
				this._dlgEl.css('left', (screenWidth - this._dlgEl.width()) / 2);
			} else {
				this._dlgEl.css('left', (screenWidth - this._options.width) / 2);
			}
		} else if (this._options.left < 0) {
			this._dlgEl.css('right', this._options.right);
		} else {
			this._dlgEl.css('left', this._options.left);
		}

		if (this._options.top < 0 && this._options.bottom < 0) {
			if (isNaN(parseInt(this._options.height))) {
				this._dlgEl.css('top', (screenHeight - this._dlgEl.height()) / 2);
			} else {
				this._dlgEl.css('top', (screenHeight - this._options.height) / 2);
			}
		} else if (this._options.top < 0) {
			this._dlgEl.css('bottom', this._options.bottom);
		} else {
			this._dlgEl.css('top', this._options.top);
		}
	};

	inews.Dialog.prototype.width = function (width) {
		if (arguments.length < 1) return this._options.width;
		this._options.width = width;

		this._dlgEl.find('.dlg-body').width(this._options.width);

		this._el.trigger(EVT_RESIZE);
	};

	inews.Dialog.prototype.height = function (height) {
		if (arguments.length < 1) return this._options.height;
		this._options.height = height;

		this._dlgEl.find('.dlg-body').height(this._options.height);

		this._el.trigger(EVT_RESIZE);
	};

	inews.Dialog.prototype.hide = function () {
		$('.dlg-modal#modal-'+this._dlgId).addClass('hidden');
		this._dlgEl.hide();
	};

	inews.Dialog.prototype.show = function () {
		$('.dlg-modal#modal-'+this._dlgId).removeClass('hidden');
		this._dlgEl.show();
	};

	inews.Dialog.prototype.getEl = function () {
		return this._el;
	};
}(jQuery));