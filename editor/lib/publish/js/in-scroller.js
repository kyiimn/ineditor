(function ($, undefined) {
	$.namespace('inews');

	var DEFAULT_OPTIONS = {
		targetEl: undefined,
		direction: 'x',
		transition: true,
		event: 'event'
	};

	var _OBJ_GET_OFFSET_LEFT = function (obj) {
		var parent = $(obj);
		var left = 0;

		do {
			parent = $(parent).parent();
			if (!$(parent).length) break;
			left += parent[0].offsetLeft;
		} while (parent[0].tagName.toLowerCase() != 'body');

		return left;
	};

	var _OBJ_GET_OFFSET_TOP = function (obj) {
		var parent = $(obj);
		var top = 0;

		do {
			parent = $(parent).parent();
			if (!$(parent).length) break;
			top += parent[0].offsetTop;
		} while (parent[0].tagName.toLowerCase() != 'body');

		return top;
	};

	inews.Scroller = function (options) {
		var targetEl;
		var self = this;

		this._options = $.extend({}, DEFAULT_OPTIONS, options);

		if (!this._options.targetEl) return;

		targetEl = $(this._options.targetEl);
		scrollArea = $('<div></div>').addClass('scroller').append($(targetEl).find('.image')).appendTo($(targetEl));

		this.pos = 0;
		this.total = $(targetEl).find('.image').length;

		if (this._options.direction == 'x') {
			//scrollArea.css('transform', 'translate(0%,0px)');
			scrollArea.css('left', '0%');
		} else {
			//scrollArea.css('transform', 'translate(0px,0%)');
			scrollArea.css('top', '0%');
		}

		$(targetEl).find('.image').each(function (idx, image) {
			if (self._options.direction == 'x') {
				$(image).css('transform', 'translate('+(idx * 100)+'%,0px)');
			} else {
				$(image).css('transform', 'translate(0px,'+(idx * 100)+'%)');
			}
		});
		if (this._options.transition) {
			scrollArea.css('transition', 'all .2s ease-in-out');
		}
		if (this._options.event == 'button') {
			$(targetEl).on('mouseup', function (e) {
				var pos, width;

				if (self._options.direction == 'x') {
					pos = e.pageX - _OBJ_GET_OFFSET_LEFT(this);
					width = $(this).width();
				} else {
					pos = e.pageY - _OBJ_GET_OFFSET_TOP(this);
					width = $(this).height();
				}
				if (pos > (width / 2)) {
					self.move(1);
				} else {
					self.move(-1);
				}
				e.preventDefault();
				e.stopPropagation();
			});
		} else if (this._options.event == 'swipe') {
			this._SWIPEMODE = false;
			this._SWIPESTART = 0;
			$(targetEl).on('touchstart mousedown', function (e) {
				var pos, pageX, pageY;
				if (e.which > 0 || e.type == 'touchstart') {
					if (e.type == 'touchstart') {
						pageX = e.originalEvent.touches[0].pageX;
						pageY = e.originalEvent.touches[0].pageY;
					} else {
						pageX = e.pageX;
						pageY = e.pageY;
					}
					if (self._options.direction == 'x') {
						pos = pageX - _OBJ_GET_OFFSET_LEFT(this);
					} else {
						pos = pageY - _OBJ_GET_OFFSET_TOP(this);
					}
					self._SWIPEMODE = true;
					self._SWIPESTART = pos;
				}
				e.preventDefault();
				e.stopPropagation();
			});
			$(targetEl).on('touchmove mousemove', function (e) {
				e.preventDefault();
				e.stopPropagation();
			});
			$(targetEl).on('touchend touchcancel mouseup mouseout', function (e) {
				var pos, pageX, pageY;
				if (self._SWIPEMODE) {
					self._SWIPEMODE = false;

					if (e.type == 'touchend' || e.type == 'touchcancel') {
						pageX = e.originalEvent.changedTouches[0].pageX;
						pageY = e.originalEvent.changedTouches[0].pageY;
					} else {
						pageX = e.pageX;
						pageY = e.pageY;
					}
					if (self._options.direction == 'x') {
						pos = pageX - _OBJ_GET_OFFSET_LEFT(this);
					} else {
						pos = pageY - _OBJ_GET_OFFSET_TOP(this);
					}
					if (self._SWIPESTART < pos) {
						self.move(-1);
					} else {
						self.move(1);
					}
				}
				e.preventDefault();
				e.stopPropagation();
			});
		}
	};

	inews.Scroller.prototype.move = function (move) {
		if (move > 0) {
			this.pos++;
			if (this.pos >= this.total) {
				this.pos = this.total - 1;
				return;
			}
		} else if (move < 0) {
			this.pos--;
			if (this.pos < 0) {
				this.pos = 0;
				return;
			}
		}
		this.draw();
	};

	inews.Scroller.prototype.go = function (pos) {
		this.pos = pos;
		if (this.pos >= this.total) {
			this.pos = this.total - 1;
		} else if (this.pos < 0) {
				this.pos = 0;
		}
		this.draw();
	};

	inews.Scroller.prototype.draw = function () {
		var scrollArea = $(this._options.targetEl).find('.scroller');
		if (this._options.direction == 'x') {
			//scrollArea.css('transform', 'translate('+(this.pos * 100 * -1)+'%,0px)');
			scrollArea.css('left', ''+(this.pos * 100 * -1)+'%');
		} else {
			//scrollArea.css('transform', 'translate(0px,'+(this.pos * 100 * -1)+'%)');
			scrollArea.css('top', ''+(this.pos * 100 * -1)+'%');
		}
	};
}(jQuery));