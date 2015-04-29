(function ($, undefined) {
	$.namespace('inews.property.video');

	inews.property.video.Video = function (options) {
		this._options = options;
		this._parentEl = options.parent;

		this._id = false;
		this._object = false;
	};

	inews.property.video.Video.instance = false;
	inews.property.video.Video.site = [];

	inews.property.video.Video.getSite = function (code) {
		var site;
		$.each(inews.property.video.Video.site, function (idx, data) {
			if (data.code != code) return true;
			site = data;
			return false;
		});
		return site;
	};

	inews.property.video.Video.create = function (parent) {
		var instance = inews.property.video.Video.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.video.Video.instance = instance = new inews.property.video.Video({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-video-title').addClass('title').html(MESSAGE['IA_VIDEO']).appendTo(instance._parentEl);

		// video-tool
		ul = $('<ul></ul>').addClass('ia-video-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-video-tool-input').attr('title', MESSAGE['IA_VIDEO_TOOLTOP_INPUT_TAG'])
		).appendTo(ul);
		/*$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-video-tool-search').attr('title', MESSAGE['IA_VIDEO_TOOLTOP_SEARCH'])
		).appendTo(ul);*/

		// selected object id
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['SELECTED_OBJECT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-video-select').attr('type', 'text').attr('disabled', true).appendTo(div);

		// video previewer
		$('<div></div>').addClass('ia-video-preview').appendTo(instance._parentEl);

		// videosite info
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_VIDEO_SITE']).appendTo(div);
		select = $('<select></select>').attr('id', 'ia-video-site').appendTo(div);
		$.each(inews.property.video.Video.site, function (idx, site) {
			$('<option></option>').val(site.code).html(site.name).appendTo(select);
		});

		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_VIDEO_WIDTH']).appendTo(div);
		$('<input></input>').attr('id', 'ia-video-width').attr('type', 'text').appendTo(div);

		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_VIDEO_HEIGHT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-video-height').attr('type', 'text').appendTo(div);

		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_VIDEO_KEY']).appendTo(div);
		$('<input></input>').attr('id', 'ia-video-key').attr('type', 'text').appendTo(div);

		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_SELECT, function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onSelect(e);
		});
		$(instance._parentEl).on(EVENT(EVT_CHANGE, EVT_INPUT), '.field input, .field select', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onChange(e);
		});
		$(instance._parentEl).find('.ia-video-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			switch (id) {
				case 'btn-ia-video-tool-input':
					instance._onInput();
					break;
				case 'btn-ia-video-tool-search':
					instance._onSearch();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.video.Video.destroy = function () {
		var instance = inews.property.video.Video.instance;

		if (!instance) return;

		$(instance._parentEl).off(EVENT(EVT_CHANGE, EVT_INPUT), '.field input, .field select');
		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).find('.ia-video-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.video.Video.prototype._onResize = function (e) {
		var video, videoWidth, videoHeight;
		var rate, realWidth, realHeight, width, height;

		$(this).find('.field input').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.field select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-video-preview').width($(this).width() - 2 - G_PROPERTY_SCROLLBAR_SIZE);

		video = $(this).find('.ia-video-preview .video-body');
		if (video.length > 0) {
			width = $(this).find('.ia-video-preview').width();
			height = $(this).find('.ia-video-preview').height();

			videoWidth = parseInt($(video).attr('data-width'));
			videoHeight = parseInt($(video).attr('data-height'));

			rate = videoWidth / videoHeight;
			realWidth = Math.round(width);
			realHeight = Math.round(width / rate);

			if (height < realHeight) {
				rate = videoHeight / videoWidth;
				realWidth = Math.round(height / rate);
				realHeight = Math.round(height);
			}
			$(video).width(realWidth);
			$(video).height(realHeight);

			$(video).css('margin-top', Math.floor((height - realHeight) / 2));
		}
		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.video.Video.prototype._onSelect = function (e) {
		this._setObject($('.editor-area .object.selected'));

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.video.Video.prototype._onChange = function (e) {
		if (this._object) {
			this._sync();
			this._preview();
		}
		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.video.Video.prototype._setObject = function (obj) {
		if ($(obj).length == 1) {
			if ($(obj).IObject('getType') != OBJECT_TYPE_VIDEO) {
				this._object = false;
				this._id = false;

				$('#ia-video-select').val(MESSAGE['IA_VIDEO_INVALID_OBJECT_TYPE']);
			} else {
				this._object = obj;
				this._id = $(obj).IObject('id');

				$('#ia-video-select').val(this._id);
			}
		} else {
			this._object = false;
			this._id = false;

			if ($(obj).length > 1) {
				$('#ia-video-select').val(MESSAGE['CONTROL_MULTISELECT_OBJID']);
			} else {
				$('#ia-video-select').val('');
			}
		}
		this._reset();
	};

	inews.property.video.Video.prototype._reset = function () {
		var data;

		$('#ia-video-site').val('');
		$('#ia-video-width').val('');
		$('#ia-video-height').val('');
		$('#ia-video-key').val('');

		if (this._object) {
			data = $(this._object).IObject('getData', OBJECT_TYPE_VIDEO);

			$('#ia-video-site').val(data.site);
			$('#ia-video-width').val(data.width);
			$('#ia-video-height').val(data.height);
			$('#ia-video-key').val(data.key);
		}
		this._preview();
	};

	inews.property.video.Video.prototype._preview = function () {
		var video, data, site;

		$('.ia-video-preview').empty();

		if (!this._object) return false;

		data = $(this._object).IObject('getData', OBJECT_TYPE_VIDEO);
		if (!data.key || !data.width || !data.height || !data.site) return false;

		site = inews.property.video.Video.getSite(data.site);
		video = site.getPreview(data);
		if (video == undefined) return false;

		$('.ia-video-preview').append(video);

		$(this._parentEl).trigger(EVT_RESIZE);
	};

	inews.property.video.Video.prototype._onInput = function () {
		var dlg, self = this;

		if (!this._object) return;

		dlg = new inews.property.video.VideoInputDlg({ id: 'ia-video-input' });
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();

				$('#ia-video-site').val(data.site);
				$('#ia-video-width').val(data.width);
				$('#ia-video-height').val(data.height);
				$('#ia-video-key').val(data.key);

				self._sync();
				self._preview();
			}
		});
	};

	inews.property.video.Video.prototype._onSearch = function () {
		var dlg, self = this;

		if (!this._object) return;

		dlg = new inews.property.video.VideoSearchDlg({ id: 'ia-video-search' });
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();

				$('#ia-video-site').val(data.site);
				$('#ia-video-width').val(data.width);
				$('#ia-video-height').val(data.height);
				$('#ia-video-key').val(data.key);

				self._sync();
				self._preview();
			}
		});
	};

	inews.property.video.Video.prototype._sync = function () {
		var width, height, data;

		width = parseInt($('#ia-video-width').val());
		height = parseInt($('#ia-video-height').val());

		data = {
			site: $('#ia-video-site').val(),
			width: (!isNaN(width)) ? width : '',
			height: (!isNaN(height)) ? height : '',
			key: $('#ia-video-key').val()
		};
		$(this._object).IObject('setData', OBJECT_TYPE_VIDEO, data);
		$(this._object).trigger(EVT_REDRAW);
	};

	G_PROPERTY_LIST.push({
		id: 'ia-video',
		name: 'Video',
		'class': inews.property.video.Video,
		icon: 'images/property/video/icon.png'
	});
}(jQuery));