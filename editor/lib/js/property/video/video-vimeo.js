(function ($, undefined) {
	$.namespace('inews.property.video');

	inews.property.video.Vimeo = function () {};

	inews.property.video.Vimeo.getPreview = function (data) {
		var video = $('<iframe></iframe>').addClass('video-body');
		video.attr('src', '//player.vimeo.com/video/' + data.key);
		video.attr('allowfullscreen', 'true');
		video.attr('frameborder', '0');
		video.attr('width', data.width);
		video.attr('height', data.height);
		video.attr('data-width', data.width);
		video.attr('data-height', data.height);

		return video;
	};
	/*
	 * <iframe src="//player.vimeo.com/video/114134370?portrait=0&amp;autoplay=1&amp;loop=1" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
	 */
	inews.property.video.Vimeo.parseURL = function (url) {
		var data = {};
		var tag, src;

		try {
			tag = $(url);
			src = tag.attr('src');

			data.width = tag.attr('width');
			data.height = tag.attr('height');
			data.site = 'vimeo';
			data.key = src.substring(src.lastIndexOf("/") + 1, src.lastIndexOf("?"));
		} catch (e) {
			return false;
		}
		return data;
	};

	inews.property.video.Video.site.push({
		getPreview: inews.property.video.Vimeo.getPreview,
		parseURL: inews.property.video.Vimeo.parseURL,
		name: 'Vimeo',
		code: 'vimeo',
		logo: 'images/property/video/site-vimeo.png',
		logoWidth: 160,
		logoHeight: 50
	});
}(jQuery));