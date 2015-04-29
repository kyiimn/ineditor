(function ($, undefined) {
	$.namespace('inews.property.audio');

	inews.property.audio.Audio = function (options) {
		this._options = options;
		this._parentEl = options.parent;

		this._id = false;
		this._object = false;
	};

	inews.property.audio.Audio.instance = false;

	inews.property.audio.Audio.create = function (parent) {
		var instance = inews.property.audio.Audio.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.audio.Audio.instance = instance = new inews.property.audio.Audio({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-audio-title').addClass('title').html(MESSAGE['IA_AUDIO']).appendTo(instance._parentEl);

		// audio-tool
		ul = $('<ul></ul>').addClass('ia-audio-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-audio-tool-modify').attr('title', MESSAGE['IA_AUDIO_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-audio-tool-delete').attr('title', MESSAGE['IA_AUDIO_TOOLTOP_DELETE'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('toggle').attr('id', 'btn-ia-audio-tool-autoplay').attr('title', MESSAGE['IA_AUDIO_TOOLTOP_AUTOPLAY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('toggle').attr('id', 'btn-ia-audio-tool-control').attr('title', MESSAGE['IA_AUDIO_TOOLTOP_CONTROL'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('toggle').attr('id', 'btn-ia-audio-tool-loop').attr('title', MESSAGE['IA_AUDIO_TOOLTOP_LOOP'])
		).appendTo(ul);

		// selected object id
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['SELECTED_OBJECT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-audio-select').attr('type', 'text').attr('disabled', true).appendTo(div);

		// audio player
		$('<div></div>').addClass('ia-audio-preview').height(G_MAIN_AUDIOPLAYER_HEIGHT).appendTo(instance._parentEl);

		// audio list header
		table = $('<table></table>').addClass('ia-audio-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_AUDIO_LIST_HEADER_NAME']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_AUDIO_LIST_HEADER_MIME']).appendTo(tr);

		// audio list
		$('<tbody></tbody>').appendTo(table);

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-audio-list .ia-audio-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-audio-list .ia-audio-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);
			instance._onModify();

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_UPDATE, function (e) {
			var oldSelected = $('.ia-audio-list .ia-audio-item.selected').attr('data-name');
			instance._reset();
			if (oldSelected) $('.ia-audio-list').find('tr[data-name='+oldSelected+']').trigger(EVT_MOUSECLICK);
		});
		$(instance._parentEl).on(EVT_SELECT, function (e) { instance._onSelect(e); });
		$(instance._parentEl).find('.ia-audio-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			switch (id) {
				case 'btn-ia-audio-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-audio-tool-delete':
					instance._onDelete();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).find('.ia-audio-tool .toggle').on(EVT_MOUSECLICK, function (e) {
			if (G_PROPERTY_LOCK) return;

			$(this).toggleClass('selected');
			instance._sync();
		});
	};

	inews.property.audio.Audio.destroy = function () {
		var instance = inews.property.audio.Audio.instance;

		if (!instance) return;

		$(document).off(EVT_MOUSECLICK, '.ia-audio-list .ia-audio-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-audio-list .ia-audio-item');

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_UPDATE);
		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).find('.ia-audio-tool .button').off(EVT_MOUSECLICK);
		$(instance._parentEl).find('.ia-audio-tool .toggle').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.audio.Audio.prototype.selectItem = function (item) {
		$(this._parentEl).find('.ia-audio-list .ia-audio-item').removeClass('selected');
		$(item).addClass('selected');
	};

	inews.property.audio.Audio.prototype._onResize = function (e) {
		$(this).find('input#ia-audio-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-audio-preview').width($(this).width() - 2 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-audio-list tr th:first-child, .ia-audio-list tr td:first-child').width($(this).width() - (2 + (80 + 1 + 8) + 8) - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-audio-list .empty td').width(inews.property.audio.Audio.instance._getRowWidth());
		$(this).find('.ia-audio-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.audio.Audio.prototype._getRowWidth = function () {
		var ths = $(this._parentEl).find('.ia-audio-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.audio.Audio.prototype._addEmptyRow = function () {
		var listEl = $(this._parentEl).find('.ia-audio-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.audio.Audio.prototype._onSelect = function (e) {
		this._setObject($('.editor-area .object.selected'));

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.audio.Audio.prototype._setObject = function (obj) {
		if ($(obj).length == 1) {
			if ($(obj).IObject('getType') != OBJECT_TYPE_AUDIO) {
				this._object = false;
				this._id = false;

				$(this._parentEl).find('#ia-audio-select').val(MESSAGE['IA_AUDIO_INVALID_OBJECT_TYPE']);
			} else {
				this._object = obj;
				this._id = $(obj).IObject('id');

				$(this._parentEl).find('#ia-audio-select').val(this._id);
			}
		} else {
			this._object = false;
			this._id = false;

			if ($(obj).length > 1) {
				$(this._parentEl).find('#ia-audio-select').val(MESSAGE['CONTROL_MULTISELECT_OBJID']);
			} else {
				$(this._parentEl).find('#ia-audio-select').val('');
			}
		}
		this._reset();
		this._preview();

		$(this._parentEl).find('.ia-audio-list').find('tr:first-child').trigger(EVT_MOUSECLICK);
	};

	inews.property.audio.Audio.prototype._reset = function () {
		var data, itemCnt = 0;
		var self = this;

		$(this._parentEl).find('.ia-audio-list tbody').empty();
		this._addEmptyRow();

		$(this._parentEl).find('.ia-audio-tool .toggle').removeClass('selected');

		if (this._object) {
			data = $(this._object).IObject('getData', OBJECT_TYPE_AUDIO);

			if (data.autoPlay) $(this._parentEl).find('.toggle#btn-ia-audio-tool-autoplay').addClass('selected');
			if (data.control) $(this._parentEl).find('.toggle#btn-ia-audio-tool-control').addClass('selected');
			if (data.loop) $(this._parentEl).find('.toggle#btn-ia-audio-tool-loop').addClass('selected');

			itemCnt = data.list.length;
			$.each(data.list, function (idx, item) {
				self._add({
					name: item.name,
					type: item.type
				});
			});
		}
	};

	inews.property.audio.Audio.prototype._add = function (data) {
		var listEl = $(this._parentEl).find('.ia-audio-list');
		var li, encodedName = MD5(data.name);

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-name='+encodedName+']');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-audio-item');
			li.attr('data-name', encodedName);
		}
		li.empty();
		li.data('name', data.name);
		li.data('type', data.type);

		$('<td></td>').html(data.name).width($(listEl).find('tr th:first-child').width()).appendTo(li);
		$('<td></td>').html(data.type).appendTo(li);

		return true;
	};

	inews.property.audio.Audio.prototype._preview = function () {
		var audio, data;

		$(this._parentEl).find('.ia-audio-preview').empty();

		if (!this._object) return false;

		data = $(this._object).IObject('getData', OBJECT_TYPE_AUDIO);

		audio = $('<audio></audio>');
		audio.attr('preload', 'preload');
		audio.attr('controls', 'controls');

		$.each(data.list, function (idx, val) {
			var src = pathGetAudio(val.name);
			$('<source></source>').attr('src', src).attr('type', val.type).appendTo(audio);
		});
		$(this._parentEl).find('.ia-audio-preview').append(audio);
	};

	inews.property.audio.Audio.prototype._onModify = function () {
		var dlg, li;
		var self = this;

		li = $(this._parentEl).find('.ia-audio-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_AUDIO_SELECTED_AUDIO_NOT_FOUND']);
			return;
		}

		dlg = new inews.property.audio.AudioPropertyDlg({
			id: 'ia-audio-modify',
			data: {
				name: li.data('name'),
				type: li.data('type')
			}
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					type: data.type
				});
				self._sync();
				self._preview();
			}
		});
	};

	inews.property.audio.Audio.prototype._onDelete = function () {
		if (!this._object) return;

		$(this._parentEl).find('.ia-audio-list tr.selected').remove();
		this._addEmptyRow();
		this._sync();

		this._preview();
	};

	inews.property.audio.Audio.prototype._sync = function () {
		var data, items = [];

		$(this._parentEl).find('.ia-audio-list tr.ia-audio-item').each(function (idx, val) {
			items.push({
				name: $(this).data('name'),
				type: $(this).data('type')
			});
		});
		data = {
			autoPlay: $(this._parentEl).find('.toggle#btn-ia-audio-tool-autoplay').hasClass('selected') ? 1 : 0,
			control: $(this._parentEl).find('.toggle#btn-ia-audio-tool-control').hasClass('selected') ? 1 : 0,
			loop: $(this._parentEl).find('.toggle#btn-ia-audio-tool-loop').hasClass('selected') ? 1 : 0,
			list: items
		};
		$(this._object).IObject('setData', OBJECT_TYPE_AUDIO, data);
		$(this._object).trigger(EVT_REDRAW);
	};

	G_PROPERTY_LIST.push({
		id: 'ia-audio',
		name: 'Audio',
		'class': inews.property.audio.Audio,
		icon: 'images/property/audio/icon.png'
	});
}(jQuery));