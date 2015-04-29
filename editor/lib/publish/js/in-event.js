var G_SCROLL_EVENT_DATA = {};

function eventInit(obj, eventDatas) {
	var event, id;

	id = obj.attr('id');

	$.each(eventDatas, function (eidx, eventData) {
		obj.data('eventCnt-' + eventData.eventId, 0);

		switch (eventData.type) {
			case 'click':
				event = 'click';
				break;
			case 'custom':
				event = eventData.customevent;
				break;
			case 'scroll':
				if (!G_SCROLL_EVENT_DATA[id]) G_SCROLL_EVENT_DATA[id] = [];
				G_SCROLL_EVENT_DATA[id].push(eventData);
				return;
			default:
				return;
		}
		eventData.sourceObject = id;

		switch (eventData.actiontype) {
			case 'style':
				$(obj).on(event, null, eventData, eventStyleHandler);
				break;
			case 'scroll':
				$(obj).on(event, null, eventData, eventScrollToHandler);
				break;
			case 'link':
				$(obj).on(event, null, eventData, eventLinkHandler);
				break;
			case 'play':
				$(obj).on(event, null, eventData, eventPlayHandler);
				break;
			case 'fireevent':
				$(obj).on(event, null, eventData, eventFireEventHandler);
				break;
			case 'script':
				$(obj).on(event, null, eventData, eventScriptHandler);
				break;
			default:
				return;
		}
	});

	$.each(G_SCROLL_EVENT_DATA, function (id, data) {
		var selector = '#'+id;
		if ($(selector).prop("tagName").toLowerCase() == 'body') selector = window;
		$(selector).on('scroll', null, [id, data], function (e) {
			var beforeScrollPos = parseInt($(this).data('BEFORE_SCROLL_POS'));
			var nowScrollPos;
			var objid = e.data[0];
			var obj = $('#'+objid);

			if (isNaN(beforeScrollPos)) beforeScrollPos = 0;
			if (G_CONF.orientation == 'landscape') {
				nowScrollPos = $(this).scrollLeft();
			} else {
				nowScrollPos = $(this).scrollTop();
			}
			$(this).data('BEFORE_SCROLL_POS', nowScrollPos);

			$.each(e.data[1], function (idx, eventData) {
				if (beforeScrollPos < eventData.eventpos_real && nowScrollPos > eventData.eventpos_real) {
					eventData.sourceObject = objid;

					switch (eventData.actiontype) {
						case 'style':		eventStyleHandler({ data: eventData });		break;
						case 'scroll':		eventScrollToHandler({ data: eventData });	break;
						case 'link':		eventLinkHandler({ data: eventData });		break;
						case 'play':		eventPlayHandler({ data: eventData });		break;
						case 'fireevent':	eventFireEventHandler({ data: eventData });	break;
						case 'script':		eventScriptHandler({ data: eventData });	break;
						default:			return;
					}
				}
			});
		});
	});
	eventComputeScrollPos();
}

function eventComputeScrollPos() {
	var refSize;

	if (G_CONF.orientation == 'landscape') {
		refSize = $('body').prop("scrollWidth");
	} else {
		refSize = $('body').prop("scrollHeight");
	}
	$.each(G_SCROLL_EVENT_DATA, function (id, data) {
		$.each(data, function (idx, eventData) {
			if (!eventData.eventpos) eventData.eventpos_real = refSize;
			if (eventData.eventpos[1] == '%') {
				eventData.eventpos_real = Math.round(refSize * (parseFloat(eventData.eventpos[0]) / 100));
			} else {
				eventData.eventpos_real = eventData.eventpos[0];
			}
		});
	});
}

function eventStyleHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var tarObjTrans = $(tarObj).data('transition');
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
		//return;
	} else {
		var defaultStyle = $(tarObj).data('default-style');
		var nowStyle = $(tarObj).data('style');
		var newStyle = {};
		var toggle = false;
		var defAnimCnt = 0;
		var newAnimCnt = 0;
		var animCnt = 0;

		$.each(eventData.datas, function (idx, css) {
			var value;

			if (css.value.length > 1) {
				if (css.value[0] == 'auto' ||
					css.value[0] == 'transparent' ||
					css.value[0] == 'initial' ||
					css.value[0] == 'inherit'
				) {
					value = css.value[0];
				} else {
					value = css.value[0] + css.value[1];
				}
			} else {
				value = css.value[0];
			}
			newStyle[css.css] = value;
		});

		if (typeof tarObjTrans == 'object') {
			$.each(newStyle, function (key, value) {
				for (var j = 0; j < tarObjTrans.length; j++) {
					if ((tarObjTrans[j].property == key) || (tarObjTrans[j].property == 'all')) {
						if (value != defaultStyle[key]) defAnimCnt++;
						if (value != nowStyle[key]) newAnimCnt++;
					}
				}
			});
		}
		if (eventData.eventRepeat == 'toggle' && (eventCnt % 2) == 1) {
			toggle = true;
			animCnt = defAnimCnt;
		} else {
			animCnt = newAnimCnt;
		}

		if (animCnt > 0 && eventData.endEvent) {
			$(tarObj).on(EVT_TRANSITIONEND, null,
			{
				sourceObject: $(srcObj).attr('id'),
				endEvent: eventData.endEvent,
				animCnt: animCnt,
				animEnd: 0
			}, function (e) {
				e.data.animEnd++;
				if (e.data.animEnd == e.data.animCnt) {
					$(tarObj).off(EVT_TRANSITIONEND);
					$('#'+e.data.sourceObject).trigger(e.data.endEvent);
				}
				e.preventDefault();
				e.stopPropagation();
			});
		}
		if (toggle) {
			$.each(newStyle, function (key, value) {
				objectSetStyle(tarObj, key, defaultStyle[key]);
			});
		} else {
			$.each(newStyle, function (key, value) {
				objectSetStyle(tarObj, key, value);
			});
		}
		if (animCnt == 0) $(srcObj).trigger(eventData.endEvent);

		$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
	}
	e.preventDefault();
	e.stopPropagation();
}

function eventScrollToHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
	} else {
		var scrollPos;

		if (eventData.eventRepeat == 'toggle' && (eventCnt % 2) == 1) {
			scrollPos = $(srcObj).data('oldScrollPos');
		} else {
			if (G_CONF.orientation == 'landscape') {
				$(srcObj).data('oldScrollPos', $(window).scrollLeft());
			} else {
				$(srcObj).data('oldScrollPos', $(window).scrollTop());
			}
			if (eventData.position[1] == '%') {
				var refSize, fV;

				if (G_CONF.orientation == 'landscape') {
					refSize = $(window).height();
				} else {
					refSize = $(window).width();
				}
				fV = parseFloat(eventData.position[0]);
				scrollPos = Math.round(refSize * (fV / 100));
			} else {
				scrollPos = eventData.position[0];
			}
		}
		if (scrollPos != $(srcObj).data('oldScrollPos')) {
			var _fireNextEvent;
			if (eventData.endEvent) {
				_fireNextEvent = function (e) {
					$(srcObj).trigger(eventData.endEvent);
					if (e) {
						e.preventDefault();
						e.stopPropagation();
					}
				};
			} else {
				_fireNextEvent = function (e) {
					if (e) {
						e.preventDefault();
						e.stopPropagation();
					}
				};
			}
			if (G_CONF.orientation == 'landscape') {
				$('html, body').animate({ scrollLeft: scrollPos }, 500, 'swing', _fireNextEvent);
			} else {
				$('html, body').animate({ scrollTop: scrollPos }, 500, 'swing', _fireNextEvent);
			}
			$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
		} else {
			_fireNextEvent();
		}
	}
	e.preventDefault();
	e.stopPropagation();
}

function eventLinkHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
	} else {
		window.open(eventData.url);

		$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
	}
	e.preventDefault();
	e.stopPropagation();
}

function eventPlayHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
	} else {
		tarObj.trigger(eventData.action+'media');

		$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
	}
	e.preventDefault();
	e.stopPropagation();
}

function eventFireEventHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
	} else {
		tarObj.trigger(eventData.event);

		$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
	}
	e.preventDefault();
	e.stopPropagation();
}

function eventScriptHandler(e) {
	var eventData = e.data;
	var eventId = eventData.eventId;
	var srcObj = $(e.target);
	var tarObj = $('#'+eventData.targetObject);
	var eventCnt = parseInt($(srcObj).data('eventCnt-'+eventId));

	if (eventData.eventRepeat == 'no-repeat' && eventCnt > 0) {
	} else {
		var func = window['userfunc_'+eventData.script];
		if (func) func(srcObj);

		$(srcObj).data('eventCnt-' + eventId, ++eventCnt);
	}
	e.preventDefault();
	e.stopPropagation();
}
