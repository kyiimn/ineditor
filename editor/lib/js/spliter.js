var G_SPLITER_RESIZE_START = false;
var G_SPLITER_RESIZE_TARGET;
var G_SPLITER_RESIZE_BEFORE_POS;

function _onSpliterResize() {
	var width = $(this).width();
	var height = $(this).height();
	var collapser = $(this).find('.collapser');
	var collapserWidth, collapserHeight;

	if (collapser.length < 1) return;

	collapserWidth = collapser.width();
	collapserHeight = collapser.height();

	if ($(this).hasClass('x-spliter')) {
		collapser.css('margin-top', (height - collapserHeight) / 2);
	} else {
		collapser.css('margin-left', (width - collapserWidth) / 2);
	}
}

function _onSpliterCollapserClick(e) {
	var elPrev = $(this).parent().prev();
	var elNext = $(this).parent().next();
	var toggled = false;

	if ($(elPrev).attr('data-collapsible') == 'true') {
		$(elPrev).toggleClass('collapse');

		if ($(elPrev).hasClass('collapse')) {
			$(elPrev).trigger(EVT_COLLAPSED);
		} else {
			$(elPrev).trigger(EVT_EXPAND);
		}
		toggled = true;
	} else if ($(elNext).attr('data-collapsible') == 'true') {
		$(elNext).toggleClass('collapse');

		if ($(elNext).hasClass('collapse')) {
			$(elNext).trigger(EVT_COLLAPSED);
		} else {
			$(elNext).trigger(EVT_EXPAND);
		}
		toggled = true;
	}
	if (toggled) $(window).trigger(EVT_RESIZE);
}

function _onSpliterMouseDown(e) {
	var elPrev = $(this).prev();
	var elNext = $(this).next();

	if ($(elPrev).attr('data-resizable') != 'true' && $(elNext).attr('data-resizable') != 'true')
		return;

	G_SPLITER_RESIZE_START = true;
	G_SPLITER_RESIZE_TARGET = $(this);

	if ($(this).hasClass('x-spliter')) {
		G_SPLITER_RESIZE_BEFORE_POS = e.clientX;
	} else {
		G_SPLITER_RESIZE_BEFORE_POS = e.clientY;
	}
	$(document).on(EVT_SELECTSTART, function (e) { return false; });
}

function _onSpliterMouseMove(e) {
	var elPrev, elNext, nowPos, elSz;
	var newPrevSz, newNextSz, limitSz;
	var move;

	if (!G_SPLITER_RESIZE_START) return;

	elPrev = $(G_SPLITER_RESIZE_TARGET).prev();
	elNext = $(G_SPLITER_RESIZE_TARGET).next();

	if ($(elPrev).hasClass('collapse') || $(elNext).hasClass('collapse')) return;

	if ($(G_SPLITER_RESIZE_TARGET).hasClass('x-spliter')) {
		nowPos = e.clientX;
		elSz = elPrev.width() + elNext.width();

		move = G_SPLITER_RESIZE_BEFORE_POS - nowPos;
		newPrevSz = elPrev.width() - move;
		newNextSz = elNext.width() + move;

		if (move > 0) {
			limitSz = parseInt(elPrev.attr('data-min-width'));
			if (!isNaN(limitSz)) {
				if (newPrevSz < limitSz) {
					newPrevSz = limitSz;
					newNextSz = elSz - newPrevSz;
				}
			}
		} else {
			limitSz = parseInt(elNext.attr('data-min-width'));
			if (!isNaN(limitSz)) {
				if (newNextSz < limitSz) {
					newNextSz = limitSz;
					newPrevSz = elSz - newNextSz;
				}
			}
		}
		elPrev.width(newPrevSz);
		elNext.width(newNextSz);
		G_SPLITER_RESIZE_BEFORE_POS = nowPos;
	} else {
		nowPos = e.clientY;
	}
	$(elPrev).trigger(EVT_RESIZE);
	$(elNext).trigger(EVT_RESIZE);
}

function _onSpliterMouseUp(e) {
	if (!G_SPLITER_RESIZE_START) return;

	_onSpliterMouseMove(e);
	G_SPLITER_RESIZE_START = false;

	$(document).off(EVT_SELECTSTART);
}

function spliterInit() {
	$('.x-spliter, .y-spliter').mousedown(_onSpliterMouseDown);
	$('.x-spliter .collapser, .y-spliter .collapser').on(EVT_MOUSECLICK, _onSpliterCollapserClick);

	$('*').on(EVT_MOUSEMOVE, _onSpliterMouseMove);
	$('*').on(EVT_MOUSEUP, _onSpliterMouseUp);
}
