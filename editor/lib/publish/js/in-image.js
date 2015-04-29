function imageInit(obj, imageData) {
	$.each(imageData.list, function (idx, data) {
		var div = $('<div></div>').addClass('image');
		var img = $('<img></img>');
		img.attr('data-width', data.width);
		img.attr('data-height', data.height);
		img.attr('data-fill', data.fill);

		switch (data.type) {
			case 'server':
				img.attr('src', G_CONF['images'] + data.name);
				break;
			case 'link':
				img.attr('src', data.name);
				break;
			default:
				return;
		}
		img.appendTo(div);

		div.appendTo(obj);
	});

	var scrollerOpt;
	switch (imageData.actionType) {
		case 'eventscroll':
			scrollerOpt = {
				targetEl: obj,
				event: 'event',
				transition: true
			};
			break;
		case 'eventchange':
			scrollerOpt = {
				targetEl: obj,
				event: 'event',
				transition: false
			};
			break;
		case 'clickchange':
			scrollerOpt = {
				targetEl: obj,
				event: 'button',
				transition: false
			};
			break;
		case 'swipe':
			scrollerOpt = {
				targetEl: obj,
				event: 'swipe',
				transition: true
			};
			break;
		case 'clickscroll':
		default:
			scrollerOpt = {
				targetEl: obj,
				event: 'button',
				transition: true
			};
			break;
	}
	var scroller = new inews.Scroller(scrollerOpt);
	$(obj).data('scroller', scroller);

	$(obj).on('next', function (e) {
		var scroller = $(this).data('scroller');
		scroller.move(1);

		e.preventDefault();
		e.stopPropagation();
	});

	$(obj).on('prev', function (e) {
		var scroller = $(this).data('scroller');
		scroller.move(-1);

		e.preventDefault();
		e.stopPropagation();
	});

	$.each(imageData.list, function (idx, data) {
		$(obj).on('go'+idx, null, [idx], function (e) {
			var scroller = $(this).data('scroller');
			var pos = parseInt(e.data[0]);

			scroller.go(pos);

			e.preventDefault();
			e.stopPropagation();
		});
	});

	$(obj).on('resize', function (e) {
		var width = $(this).width();
		var height = $(this).height();

		$(this).find('.image').each(function (idx, image) {
			var img = $(this).find('img');
			var imgWidth = parseInt($(img).attr('data-width'));
			var imgHeight = parseInt($(img).attr('data-height'));
			var imgFill = $(img).attr('data-fill');
			var rate, realWidth, realHeight;

			$(image).width(width);
			$(image).height(height);

			switch (imgFill) {
				case 'autofit-inner':
					rate = imgWidth / imgHeight;
					realWidth = Math.round(width);
					realHeight = Math.round(width / rate);

					if (height < realHeight) {
						rate = imgHeight / imgWidth;
						realWidth = Math.round(height / rate);
						realHeight = Math.round(height);
					}
					$(img).width(realWidth);
					$(img).height(realHeight);

					$(img).css('margin-top', Math.floor((height - realHeight) / 2));
					$(img).css('margin-left', Math.floor((width - realWidth) / 2));
					break;

				case 'autofit-outer':
					rate = imgWidth / imgHeight;
					realWidth = Math.round(width);
					realHeight = Math.round(width / rate);

					if (height > realHeight) {
						rate = imgHeight / imgWidth;
						realWidth = Math.round(height / rate);
						realHeight = Math.round(height);
					}
					$(img).width(realWidth);
					$(img).height(realHeight);

					$(img).css('margin-top', Math.floor((height - realHeight) / 2));
					$(img).css('margin-left', Math.floor((width - realWidth) / 2));
					break;

				case 'fill':
				default:
					$(img).css('width', '100%');
					$(img).css('height', '100%');
					break;
			}
		});
		e.preventDefault();
		e.stopPropagation();
	});
}