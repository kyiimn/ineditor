(function ($, undefined) {
	$.namespace('inews.property');
}(jQuery));

var G_PROPERTY_LIST = [];
var G_PROPERTY_LOCK = false;
var G_PROPERTY_SCROLLBAR_SIZE = 18;

function _onPropertyBoxResize(e) {
	var width = $(this).width();
	var listBoxWidth = $(this).find('.property-list-box').width();
	var listBoxHeight = $(this).find('.property-list-box').height();

	$(this).find('.property-body-box').width(width - listBoxWidth - (4 + 2 + (6 * 2)));
	$(this).find('.property-body-box').height(listBoxHeight - 12);
	$(this).find('.property-body-box').trigger(EVT_RESIZE);

	e.preventDefault();
	e.stopPropagation();
}

function propertyInit() {
	var propertyBox = $('section .property-box');
	var bodyBox = $(propertyBox).find('.property-body-box');
	var listBox = $(propertyBox).find('.property-list-box');

	$(propertyBox).on(EVT_RESIZE, _onPropertyBoxResize);

	$(document).on(EVENT(EVT_SELECT, EVT_UNSELECT), '.editor-area .object', function (e) {
		if (G_PROPERTY_LOCK) return;
		$(bodyBox).trigger(EVT_SELECT);
	});
	$(document).on(EVT_UPDATE, '.editor-area .object', function (e) {
		if (G_PROPERTY_LOCK) return;
		$(bodyBox).trigger(EVT_UPDATE);
	});

	for (var i = 0; i < G_PROPERTY_LIST.length; i++) {
		var info = G_PROPERTY_LIST[i];
		var a = $('<a></a>');
		a.attr('id', 'btn-'+info.id);
		a.attr('data-index', i);
		a.attr('title', info.name);
		a.addClass('button');
		a.css('background-image', 'url('+info.icon+')');
		a.appendTo(listBox);
	}

	$(listBox).find('.button').on(EVT_MOUSECLICK, function (e) {
		var oldSelected = $(listBox).find('.button.selected');
		var newIdx = parseInt($(this).attr('data-index'));

		if (G_PROPERTY_LOCK) return;

		e.preventDefault();
		e.stopPropagation();

		if (oldSelected.length) {
			var oldIdx = parseInt($(oldSelected).attr('data-index'));

			if (propertyBox.hasClass('collapse')) {
				$(propertyBox.prev()).find('.collapser').trigger('click');
			}
			if (newIdx == oldIdx) return;

			G_PROPERTY_LIST[oldIdx]['class'].destroy(bodyBox);

			$(bodyBox).empty();
		}
		$(listBox).find('.button').removeClass('selected');

		$(this).addClass('selected');
		G_PROPERTY_LIST[newIdx]['class'].create(bodyBox);

		$(propertyBox).trigger(EVT_RESIZE);
		$(bodyBox).trigger(EVT_SELECT);
	});
	$(listBox).find('.button:first').trigger(EVT_MOUSECLICK);
}

function propertySetLock(val) {
	G_PROPERTY_LOCK = val;
}