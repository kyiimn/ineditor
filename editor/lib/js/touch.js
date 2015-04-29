var EVT_TOUCHTAP = 'touchvtap';
var EVT_TOUCHDBLTAP = 'touchvdbltap';
var EVT_TOUCHMOVE = 'touchvmove';
var EVT_TOUCHDOWN = 'touchvdown';
var EVT_TOUCHUP = 'touchvup';

var TOUCH_EVENT_STARTTARGET;

function _hasEvent(el, event) {
	var handle = $._data($(el)[0], 'events');
	var found = false;

	if (!handle) handle = {};

	$.each(handle, function (key, val) {
		if (key.toLowerCase() == event.toLowerCase()) found = true;
	});
	return found;
}

function _onTouchStart(e) {
	var te;

	te = $.Event(EVT_TOUCHDOWN);
	te.data = e.data;
	te.target = e.target;
	te.originalEvent = e.originalEvent;
	te.view = e.view;

	$(e.target).trigger(te);

	if (e.originalEvent.touches.length > 1) {
		TOUCH_EVENT_STARTTARGET = false;
	} else {
		TOUCH_EVENT_STARTTARGET = e.target;
	}
	if ((_hasEvent(e.target, EVT_TOUCHDOWN) ||
		_hasEvent(e.target, EVT_TOUCHTAP) ||
		_hasEvent(e.target, EVT_TOUCHDBLTAP)) &&
		(e.target.nodeName.toLowerCase() != 'input' &&
		 e.target.nodeName.toLowerCase() != 'select' &&
		 e.target.nodeName.toLowerCase() != 'button')
	) {
		e.preventDefault();
		e.stopPropagation();
	}
}

function _onTouchStop(e) {
	var endEventTS, te;
	var now = Date.now();

	endEventTS = $(e.target).data('lastEventTimestamp');
	if (endEventTS == undefined) endEventTS = 0;

	$(e.target).data('lastEventTimestamp', now);

	te = $.Event(EVT_TOUCHUP);
	te.data = e.data;
	te.target = e.target;
	te.originalEvent = e.originalEvent;
	te.view = e.view;

	$(e.target).trigger(te);

	if (TOUCH_EVENT_STARTTARGET == e.target) {
		if (endEventTS + 500 > now) {
			te = $.Event(EVT_TOUCHDBLTAP);
		} else {
			te = $.Event(EVT_TOUCHTAP);
		}
		te.data = e.data;
		te.target = e.target;
		te.originalEvent = e.originalEvent;
		te.view = e.view;

		$(e.target).trigger(te);
	}

	if (e.target.nodeName.toLowerCase() != 'input' &&
		e.target.nodeName.toLowerCase() != 'select' &&
		e.target.nodeName.toLowerCase() != 'button'
	) {
		if (e.cancelable) e.preventDefault();
		e.stopPropagation();
	}
}

function _onTouchMove(e) {
	var te;

	te = $.Event(EVT_TOUCHMOVE);
	te.data = e.data;
	te.target = e.target;
	te.originalEvent = e.originalEvent;
	te.view = e.view;
	$(e.target).trigger(te);
}

function touchInit() {
	$('body').addClass('x-touch');

	$('*').on('touchstart', _onTouchStart);
	$('*').on('touchmove', _onTouchMove);
	$('*').on('touchend touchcancel', _onTouchStop);
}