(function ($, undefined) {
	$.namespace('inews.property.video');

	inews.property.video.YouTube = function () {};

	inews.property.video.YouTube.getPreview = function (data) {
		var video = $('<iframe></iframe>').addClass('video-body');
		video.attr('src', '//www.youtube.com/embed/' + data.key);
		video.attr('allowfullscreen', 'true');
		video.attr('width', data.width);
		video.attr('height', data.height);
		video.attr('data-width', data.width);
		video.attr('data-height', data.height);

		return video;
	};

	inews.property.video.YouTube.parseURL = function (url) {
		var data = {};
		var tag, src;

		try {
			tag = $(url);
			src = tag.attr('src');

			data.width = tag.attr('width');
			data.height = tag.attr('height');
			data.site = 'youtube';
			data.key = src.substring(src.lastIndexOf("/") + 1);
		} catch (e) {
			return false;
		}
		return data;
	};

	inews.property.video.Video.site.push({
		getPreview: inews.property.video.YouTube.getPreview,
		parseURL: inews.property.video.YouTube.parseURL,
		name: 'YouTube',
		code: 'youtube',
		logo: 'images/property/video/site-youtube.png',
		logoWidth: 160,
		logoHeight: 70
	});
}(jQuery));