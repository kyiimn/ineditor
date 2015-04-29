(function($, undefined) {
	$.widget('inews.ContextMenu', {
		options: {
			x: 0,
			y: 0,
			items: []
		},

		_createElement: function () {
			var self = this;
			var ul, i = 0;

			$(this.element).addClass('context-wrap');

			$('<div></div>').addClass('context-mousearea').appendTo('body');

			ul = $('<ul>');
			ul.appendTo($(this.element));

			for (i = 0; i < this.options.items.length; i++) {
				var handler;
				var li, a;

				li = $('<li></li>');

				if (this.options.items[i] == '-') {
					$('<hr>').appendTo(li);
				} else {
					btn = $('<span></span>').appendTo(li);
					if (this.options.items[i].checkbox != undefined) {
						$('<input></input>').attr('type', 'checkbox').prop('disabled', true).prop('checked', this.options.items[i].checkbox).appendTo(btn);
					} else if (this.options.items[i].radio != undefined) {
						$('<input></input>').attr('type', 'radio').prop('disabled', true).prop('checked', this.options.items[i].checkbox).appendTo(btn);
					}
					a = $('<a></a>').attr('href', '#').html(this.options.items[i].text).appendTo(li);
					handler = this.options.items[i].handler;
					if (!handler) handler = function () {};
				}
				li.on('click', { handler: handler }, function (e) {
					e.data.handler();
					$(self.element).remove();
					//$(self.element).ContextMenu('destroy');
				});
				ul.append(li);
			}
		},

		_create: function () {
			var self = this;
			var bodyWidth = $('body').width();
			var bodyHeight = $('body').height();

			this._createElement();

			$(this.element).css('top', this.options.y + 5);
			$(this.element).css('left', this.options.x + 5);
			$(this.element).show();

			if (this.options.x + $(this.element).width() > bodyWidth) {
				$(this.element).css('left', bodyWidth - 10 - $(this.element).width());
			}
			if (this.options.y + $(this.element).height() > bodyHeight) {
				$(this.element).css('top', bodyHeight - 10 - $(this.element).height());
			}
		},

		_init: function () {
			var self = this;

			$(document).on('mousedown mouseup click', '.context-mousearea', function (e) {
				if (e.which != 1) return;
				$(self.element).remove();
				//$(self.element).ContextMenu('destroy');
			});
		},

		destroy: function () {
			$(this.element).find('li').each(function() {
				$(this).off('click');
			});
			$(document).off('mousedown mouseup click', '.context-mousearea');

			$('.context-mousearea').remove();
			//$(this.element).remove();

			$.Widget.prototype.destroy.apply(this, arguments);
		}
	});
}(jQuery));
