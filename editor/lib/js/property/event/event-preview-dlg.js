(function ($, undefined) {
	var EVENT_TYPE_CLICK = 'click';
	var EVENT_TYPE_AFTER = 'after';
	var EVENT_TYPE_CUSTOM = 'custom';

	var EVENT_ACTION_TYPE_CHANGE_STYLE = 'style';
	var EVENT_ACTION_TYPE_SCROLL_TO = 'scroll';
	var EVENT_ACTION_TYPE_PLAY = 'play';
	var EVENT_ACTION_TYPE_LINK = 'link';
	var EVENT_ACTION_TYPE_FIREEVENT = 'fireevent';
	var EVENT_ACTION_TYPE_SCRIPT = 'script'

	$.namespace('inews.property.event');

	inews.property.event.EventPreviewDlg = function (options) {
		var orientation = $('.editor-area').IEditor('getOrientation');
		var body, field, select, button;
		var el, self = this;

		this._options = options;

		// +++ 창을 열기전 상태 저장
		this._oldScrollPosition = (orientation == ORIENTATION_LANDSCAPE) ? $('.editor-area').scrollLeft() : $('.editor-area').scrollTop();
		this._oldSelectObjects = $('.editor-area .selected');

		this._oldEditorLockSet = {};
		this._oldEditorLockSet[EDITOR_LOCK_MOVE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_MOVE);
		this._oldEditorLockSet[EDITOR_LOCK_SELECT] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_SELECT);
		this._oldEditorLockSet[EDITOR_LOCK_RESIZE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_RESIZE);
		this._oldEditorLockSet[EDITOR_LOCK_CREATE] = $('.editor-area').IEditor('getLock', EDITOR_LOCK_CREATE);

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, true);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, true);

		propertySetLock(true);
		$(this._oldSelectObjects).IObject('unselect');
		// --- 창을 열기전 상태 저장

		// +++ transition 활성화
		$('.editor-area .object').each(function (idx, obj) {
			$(obj).IObject('applyData', 'animation');
			$(obj).IObject('applyData', 'transition');
			$(obj).IObject('saveCSS');
		});
		// --- transition 활성화

		body = $('<div></div>').addClass('ia-event-preview').addClass('ia-event-dlg');
		if (options.id) body.attr('id', options.id);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_PREVIEW_CURRENT_EVENT']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-preview-current-event').attr('type', 'text').attr('readonly', true).appendTo(field);

		field = $('<div></div>').addClass('field').appendTo(body);
		$('<label></label>').html(MESSAGE['IA_EVENT_PREVIEW_NEXT_EVENT']).appendTo(field);
		$('<input></input>').attr('id', 'ia-event-preview-next-event').attr('type', 'text').attr('readonly', true).appendTo(field);

		$('<hr></hr>').appendTo(body);

		button = $('<div></div>').addClass('buttonset').appendTo(body);
		$('<button></button>').attr('id', 'ia-event-preview-step').attr('data-action', BTN_STEP).html(MESSAGE['STEP_BY_STEP']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-preview-continue').attr('data-action', BTN_CONTINUE).html(MESSAGE['CONTINUE']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-preview-undo').attr('data-action', BTN_UNDO).html(MESSAGE['UNDO']).appendTo(button);
		$('<button></button>').attr('id', 'ia-event-preview-close').attr('data-action', BTN_CLOSE).html(MESSAGE['CLOSE']).appendTo(button);

		this.dlg = new inews.Dialog({
			top: 20,
			right: 30,
			width: 300,
			//height: 75,
			modal: false,
			el: body,
 			title: MESSAGE['IA_EVENT_PREVIEW'],
			showCloseBtn: false
		});

		this._el = this.dlg.getEl();
		this._events = this.getEvents(this._options.eventId);

		this.reset();

		$(this._el).find('.buttonset button').on(EVT_MOUSECLICK, function (e) {
			var action = $(this).attr('data-action');

			switch (action) {
				case BTN_STEP:
					self.go(false);
					break;
				case BTN_CONTINUE:
					self.go(true);
					break;
				case BTN_UNDO:
					self.reset();
					break;
				case BTN_CLOSE:
					self.close();
				default:
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.EventPreviewDlg.prototype.reset = function () {
		var orientation = $('.editor-area').IEditor('getOrientation');

		$('.editor-area .object').each(function (idx, obj) {
			$(obj).IObject('unapplyData', 'animation');
			$(obj).IObject('unapplyData', 'transition');
			$(obj).IObject('loadCSS');
		});

		if (orientation == ORIENTATION_LANDSCAPE) {
			$('.editor-area').scrollLeft(this._oldScrollPosition);
		} else {
			$('.editor-area').scrollTop(this._oldScrollPosition);
		}

		$('.editor-area .object').each(function (idx, obj) {
			$(obj).IObject('applyData', 'animation');
			$(obj).IObject('applyData', 'transition');
		});
		$(this._el).find('#ia-event-preview-current-event').val(MESSAGE['IA_EVENT_PREVIEW_NONE_EVENT']);
		if (this._events) {
			var val;
			switch (this._events.event.type) {
				case EVENT_TYPE_CLICK: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_CLICK']; break;
				case EVENT_TYPE_AFTER: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_AFTER']; break;
				case EVENT_TYPE_CUSTOM: val = this._events.event.customevent; break;
				default: val = this.event._events.type; break;
			}
			$(this._el).find('#ia-event-preview-next-event').val(val);
		} else {
			$(this._el).find('#ia-event-preview-next-event').val(MESSAGE['IA_EVENT_PREVIEW_NONE_EVENT']);
		}
		this._nowPos = 0;
	};

	inews.property.event.EventPreviewDlg.prototype.getEvents = function (eventId) {
		var events = false;
		var self = this;

		var _getNextEvent = function (event) {
			var nextEvents = [];

			if (!event.endEvent) return nextEvents;

			for (var i = 0; i < self._options.events.length; i++) {
				if (event.endEvent == 'click') {
					if (self._options.events[i].type == EVENT_TYPE_CLICK) {
						var nextEvent = {};
						nextEvent.event = self._options.events[i];
						nextEvent.next = _getNextEvent(nextEvent.event);
						nextEvents.push(nextEvent);
					}
				} else {
					if (self._options.events[i].type == EVENT_TYPE_CUSTOM &&
						self._options.events[i].customevent == event.endEvent
					) {
						var nextEvent = {};
						nextEvent.event = self._options.events[i];
						nextEvent.next = _getNextEvent(nextEvent.event);
						nextEvents.push(nextEvent);
					}
				}
			}
			return nextEvents;
		};

		for (var i = 0; i < this._options.events.length; i++) {
			if (this._options.events[i].eventId != eventId) continue;
			events = {};
			events.event = this._options.events[i];
			events.next = _getNextEvent(events.event);
			break;
		}
		return events;
	};

	inews.property.event.EventPreviewDlg.prototype.close = function () {
		var el = this.dlg.getEl();
		var orientation = $('.editor-area').IEditor('getOrientation');

		$(el).find('.buttonset button').off(EVT_MOUSECLICK);
		this.dlg.close();

		$('.editor-area .object').each(function (idx, obj) {
			$(obj).IObject('unapplyData', 'animation');
			$(obj).IObject('unapplyData', 'transition');
			$(obj).IObject('loadCSS');
		});

		// 창을 열기전 상태로 회귀
		if (orientation == ORIENTATION_LANDSCAPE) {
			$('.editor-area').scrollLeft(this._oldScrollPosition);
		} else {
			$('.editor-area').scrollTop(this._oldScrollPosition);
		}

		$('.editor-area .selected').IObject('unselect');
		$(this._oldSelectObjects).IObject('select');

		$('.editor-area').IEditor('setLock', EDITOR_LOCK_MOVE, this._oldEditorLockSet[EDITOR_LOCK_MOVE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_SELECT, this._oldEditorLockSet[EDITOR_LOCK_SELECT]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_RESIZE, this._oldEditorLockSet[EDITOR_LOCK_RESIZE]);
		$('.editor-area').IEditor('setLock', EDITOR_LOCK_CREATE, this._oldEditorLockSet[EDITOR_LOCK_CREATE]);

		propertySetLock(false);
	};

	inews.property.event.EventPreviewDlg.prototype.go = function (next) {
		var runEvents, nextEventCnt = 0;
		var self = this;
		var _getNextEvent = function (event, step) {
			var events = [];

			if (step == 0) {
				events.push(event);
			} else {
				for (var i = 0; i < event.next.length; i++) {
					events = events.concat(_getNextEvent(event.next[i], step - 1));
				}
			}
			return events;
		};

		if (this._nowPos < 0) {
			alert(MESSAGE['IA_EVENT_PREVIEW_END_OF_EVENT']);
			return;
		}

		runEvents = _getNextEvent(this._events, this._nowPos);
		if (next) {
			this._nowPos = -1;
		} else {
			for (var i = 0; i < runEvents.length; i++) {
				nextEventCnt += runEvents[i].next.length;
			}
			if (nextEventCnt < 1) {
				this._nowPos = -1;
			} else {
				this._nowPos++;
			}
		}
		this.run(runEvents, next);
	};

	inews.property.event.EventPreviewDlg.prototype.run = function (datas, next) {
		var self = this;
		var nowEvent = $(this._el).find('#ia-event-preview-next-event').val();
		var nextEvent = '';

		$.each(datas, function (idx, data) {
			switch (data.event.actiontype) {
				case EVENT_ACTION_TYPE_CHANGE_STYLE:
					self.runChangeStyle(data, next);
					break;
				case EVENT_ACTION_TYPE_SCROLL_TO:
					self.runScrollTo(data, next);
					break;
				case EVENT_ACTION_TYPE_LINK:
					self.runLink(data);
					break;
				case EVENT_ACTION_TYPE_PLAY:
					self.runPlay(data);
					break;
				case EVENT_ACTION_TYPE_FIREEVENT:
					self.runFireEvent(data);
					break;
				case EVENT_ACTION_TYPE_SCRIPT:
					self.runScript(data);
					break;
				default:
					break;
			}
			$.each(data.next, function (nidx, ndata) {
				var val;
				switch (ndata.event.type) {
					case EVENT_TYPE_CLICK: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_CLICK']; break;
					case EVENT_TYPE_AFTER: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_AFTER']; break;
					case EVENT_TYPE_CUSTOM: val = ndata.event.customevent; break;
					default: val = ndata.event.type; break;
				}
				if (nextEvent != '') nextEvent += ', ';
				nextEvent += val;
			});
		});
		if (nextEvent == '') nextEvent = MESSAGE['IA_EVENT_PREVIEW_NONE_EVENT'];

		$(this._el).find('#ia-event-preview-current-event').val(nowEvent);
		$(this._el).find('#ia-event-preview-next-event').val(nextEvent);
	};

	inews.property.event.EventPreviewDlg.prototype.runChangeStyle = function (data, next) {
		var orientation = $('.editor-area').IEditor('getOrientation');
		var targetObject = $('.editor-area #'+data.event.targetObject);
		var targetTransition = $(targetObject).IObject('getData', 'transition');
		var animCnt = 0;
		var self = this;

		if (next) {
			if (typeof targetTransition == 'object') {
				$.each(data.event.datas, function (idx, css) {
					for (var j = 0; j < targetTransition.length; j++) {
						if ((targetTransition[j].property == css.css) || (targetTransition[j].property == 'all')) {
							var nowCss = $(targetObject).IObject('css', css.css);
							if (css.value.length == 1) {
								if (css.value[0] != nowCss[0]) animCnt++;
							} else {
								if (css.value[1] == nowCss[1]) {
									if (css.value[0] != nowCss[0]) animCnt++;
								} else {
									var refSize = (orientation == ORIENTATION_LANDSCAPE) ? $(targetObject).parent().width() : $(targetObject).parent().height();
									var orgV = (css.value[1] == '%') ? orgV = Math.round(refSize * (css.value[0] / 100)) : css.value[0];
									var newV = (nowCss[1] == '%') ? Math.round(refSize * (nowCss[0] / 100)) : nowCss[0];

									if (orgV != newV) animCnt++;
								}
							}
						}
					}
				});
			}
			if (animCnt > 0) {
				$(targetObject).data('animCnt-'+data.event.eventId, animCnt);
				$(targetObject).data('animEnd-'+data.event.eventId, 0);
				$(targetObject).on(EVT_TRANSITIONEND, null, { next: data.next }, function (e) {
					var animCnt = $(this).data('animCnt-'+data.event.eventId);
					var animEnd = $(this).data('animEnd-'+data.event.eventId);

					e.preventDefault();
					e.stopPropagation();

					animEnd++;
					$(this).data('animEnd-'+data.event.eventId, animEnd);
					if (animEnd == animCnt) {
						$(this).off(EVT_TRANSITIONEND);
						self.run(e.data.next, next);
					}
					$(this).trigger(EVT_RESIZE);
				});
			}
		}

		$.each(data.event.datas, function (idx, css) {
			if (css.value.length == 1) {
				$(targetObject).IObject('css', css.css, css.value[0]);
			} else {
				$(targetObject).IObject('css', css.css, css.value[0], css.value[1]);
			}
		});

		if (animCnt < 1 && next) {
			this.run(data.next, next);
		}
	};

	inews.property.event.EventPreviewDlg.prototype.runScrollTo = function (data, next) {
		var orientation = $('.editor-area').IEditor('getOrientation');
		var refSize = (orientation == ORIENTATION_LANDSCAPE) ? $('.editor-area .editor').width() : $('.editor-area .editor').height();
		var self = this;

		var scrollPos = data.event.position[0];
		var nowPos;

		if (data.event.position[1] == '%') {
			scrollPos = Math.round(refSize * (scrollPos / 100));
		}

		if (orientation == ORIENTATION_LANDSCAPE) {
			nowPos = $('.editor-area').scrollLeft();
		} else {
			nowPos = $('.editor-area').scrollTop();
		}

		if (nowPos == scrollPos) {
			if (next) this.run(data.next, next);
		} else {
			if (orientation == ORIENTATION_LANDSCAPE) {
				$('.editor-area').animate({ scrollLeft: scrollPos }, 500, 'swing', (next) ? function () { self.run(data.next, next); } : function () {});
			} else {
				$('.editor-area').animate({ scrollTop: scrollPos }, 500, 'swing', (next) ? function () { self.run(data.next, next); } : function () {});
			}
		}
	};

	inews.property.event.EventPreviewDlg.prototype.runLink = function (data) {
		messageBox(data.event.url, MESSAGE['IA_EVENT_PREVIEW'], true);
	};

	inews.property.event.EventPreviewDlg.prototype.runPlay = function (data) {
		var str = SPRINTF(MESSAGE['IA_EVENT_PREVIEW_FIREEVENT'], data.event.targetObject, data.event.action);
		messageBox(str, MESSAGE['IA_EVENT_PREVIEW'], true);
	};

	inews.property.event.EventPreviewDlg.prototype.runFireEvent = function (data) {
		var str = SPRINTF(MESSAGE['IA_EVENT_PREVIEW_FIREEVENT'], data.event.targetObject, data.event.event);
		messageBox(str, MESSAGE['IA_EVENT_PREVIEW'], true);
	};

	inews.property.event.EventPreviewDlg.prototype.runScript = function (data) {
		var str = SPRINTF(MESSAGE['IA_EVENT_PREVIEW_SCRIPT'], data.event.targetObject, data.event.script);
		messageBox(str, MESSAGE['IA_EVENT_PREVIEW'], true);
	};
}(jQuery));