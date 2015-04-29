function audioInit(obj, audioData) {
	var audio = $('<audio></audio>');

	audio.attr('preload', 'preload');
	if (audioData.autoPlay) audio.attr('autoplay', 'autoplay');
	if (audioData.control) audio.attr('controls', 'controls');
	if (audioData.loop) audio.attr('loop', 'loop');

	$.each(audioData.list, function (idx, val) {
		var src = G_CONF['audio']+val.name;
		$('<source></source>').attr('src', src).attr('type', val.type).appendTo(audio);
	});
	$(obj).append(audio);

	$(obj).on('playmedia', function (e) {
		e.preventDefault();
		e.stopPropagation();

		audioPlay($(this));
	});
	$(obj).on('stopmedia', function (e) {
		e.preventDefault();
		e.stopPropagation();

		audioStop($(this));
	});
	$(obj).on('togglemedia', function (e) {
		e.preventDefault();
		e.stopPropagation();

		audioToggle($(this));
	});
}

function audioPlay(obj) {
	var audio = $(obj).find('audio');
	audio.trigger('play');
}

function audioStop(obj) {
	var audio = $(obj).find('audio');
	audio.trigger('pause');
	audio.prop('currentTime', 0);
}

function audioToggle(obj) {
	var audio = $(obj).find('audio');
	audio.trigger('pause');
}
