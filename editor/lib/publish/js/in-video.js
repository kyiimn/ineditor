function videoInit(obj, videoData) {
	$(obj).attr('data-site', videoData.site);

	switch (videoData.site) {
		case 'youtube':
			$('<div></div>').attr('id', $(obj).attr('id')+'-player').addClass('youtube-player').appendTo($(obj));
			break;
		case 'vimeo':
			$('<iframe></iframe>').attr('id', $(obj).attr('id')+'-player').
			attr('src', '//player.vimeo.com/video/'+videoData.key+'?api=1&player_id='+$(obj).attr('id')+'-player').
			attr('width', '100%').attr('height', '100%').appendTo($(obj));

			$(obj).on('playmedia', function (e) {
				e.preventDefault();
				e.stopPropagation();

				videoPlay($(this));
			});
			$(obj).on('stopmedia', function (e) {
				e.preventDefault();
				e.stopPropagation();

				videoStop($(this));
			});
			$(obj).on('togglemedia', function (e) {
				e.preventDefault();
				e.stopPropagation();

				videoToggle($(this));
			});
			break;
		default:
			break;
	}
}

function videoLoadYoutubeAPI() {
	var script = $('<script></script>');

	script.attr('type', 'text/javascript');
	script.attr('src', 'https://www.youtube.com/iframe_api');
	script.appendTo($('head'));
}

function videoLoadVimeoAPI() {
	var script = $('<script></script>');

	script.attr('type', 'text/javascript');
	script.attr('src', '//f.vimeocdn.com/js/froogaloop2.min.js');
	script.appendTo($('head'));
}

function videoPlay(obj) {
	var site = $(obj).attr('data-site');

	if (site == 'youtube') {
		var player = $(obj).data('player');
		player.playVideo();
	} else if (site == 'vimeo') {
		var player = $f(($(obj).find('iframe'))[0]);
		player.api('play');
	}
}

function videoStop(obj) {
	var site = $(obj).attr('data-site');

	if (site == 'youtube') {
		var player = $(obj).data('player');
		player.stopVideo();
	} else if (site == 'vimeo') {
		var player = $f(($(obj).find('iframe'))[0]);
		player.api('pause');
	}
}

function videoToggle(obj) {
	var site = $(obj).attr('data-site');

	if (site == 'youtube') {
		var player = $(obj).data('player');
		var state = player.getPlayerState();
		switch (state) {
			case -1:
			case 0:
			case 2:
			case 5:
				videoPlay(obj);
				break;
			case 1:
				videoStop(obj);
				break;
			default:
				break;
		}
	} else if (site == 'vimeo') {
		var player = $f(($(obj).find('iframe'))[0]);
		player.api('play');
	}
}

function onYouTubeIframeAPIReady() {
	$('.youtube-player').each(function (idx, player) {
		var obj = $(player).parent();
		var videoData = obj.data('video');

		var ytplayer = new YT.Player($(player).attr('id'), {
			height: '100%',//videoData.height,
			width: '100%',//videoData.width,
			videoId: videoData.key,
			playerVars: {
				autohide: 1,
				autoplay: 0,
				controls: 0,
				loop: 0,
				showinfo: 0
			}
		});
		obj.data('player', ytplayer);
		obj.on('playmedia', function (e) {
			e.preventDefault();
			e.stopPropagation();

			videoPlay($(this));
		});
		obj.on('stopmedia', function (e) {
			e.preventDefault();
			e.stopPropagation();

			videoStop($(this));
		});
		obj.on('togglemedia', function (e) {
			e.preventDefault();
			e.stopPropagation();

			videoToggle($(this));
		});
	});
}
