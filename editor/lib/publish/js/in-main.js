var EVT_TRANSITIONEND;
var IMAGE_COUNT;
var IMAGE_LOADCOMPLETE;

function loadingInit() {
	var _loadComplete = function (e) {
		IMAGE_LOADCOMPLETE++;
		if (IMAGE_LOADCOMPLETE >= IMAGE_COUNT) {
			$('.loading').fadeOut(1000, function (e) { $(this).remove(); });
		}
	};
	IMAGE_COUNT = G_IMAGE_LIST.length;
	IMAGE_LOADCOMPLETE = 0;

	if (IMAGE_COUNT > 0) {
		for (var i = 0; i < IMAGE_COUNT; i++) {
			var img = new Image();
			img.onload = _loadComplete;
			img.src = G_CONF['images'] + G_IMAGE_LIST[i];
		}
	} else {
		_loadComplete();
	}
}

function mainInit() {
	var obj = $('body');

	$(obj).attr('id', 'body-'+(Math.floor((new Date()).getTime() / 1000)));

	$.each(G_BODY_DATA, function (key, value) {
		$(obj).data(key, value);
		switch (key) {
			case 'script':
				// skip
				break;
			case 'event':
				eventInit(obj, value);
				break;
			default:
				break;
		}
	});
}

$(document).ready(function () {
	$(window).resize(function (e) {
		var width = $(this).width();
		var height = $(this).height();

		$('body').css('min-width', width);
		$('body').css('min-height', height);

		if (G_CONF.orientation == 'landscape') {
			$('body').css('max-height', height);
			$('body').css('overflow-y', 'hidden');
		} else {
			$('body').css('max-width', width);
			$('body').css('overflow-x', 'hidden');
		}

		$('body > .object').each(function (idx, obj) {
			objectRedrawStyle($(obj));
		});
		$('div[data-type="image"]').each(function (idx, obj) {
			$(obj).trigger('resize');
		});
		eventComputeScrollPos();
	});
	if (browser.webkit) {
		EVT_TRANSITIONEND = 'transitionend';
	} else if (browser.mozilla) {
		EVT_TRANSITIONEND = 'transitionend';
	} else {
		EVT_TRANSITIONEND = 'transitionend';
	}
	mainInit();
	objectInit();

	$(window).trigger('resize');

	loadingInit();
});