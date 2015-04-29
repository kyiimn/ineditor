(function ($, undefined) {
	var EVENT_TYPE_CLICK = 'click';
	var EVENT_TYPE_AFTER = 'after';
	var EVENT_TYPE_CUSTOM = 'custom';
	var EVENT_TYPE_SCROLL = 'scroll';

	var EVENT_ACTION_TYPE_CHANGE_STYLE = 'style';
	var EVENT_ACTION_TYPE_SCROLL_TO = 'scroll';
	var EVENT_ACTION_TYPE_PLAY = 'play';
	var EVENT_ACTION_TYPE_LINK = 'link';
	var EVENT_ACTION_TYPE_FIREEVENT = 'fireevent';
	var EVENT_ACTION_TYPE_SCRIPT = 'script'

	$.namespace('inews.property.event');

	inews.property.event.Event = function (options) {
		this._options = options;
		this._parentEl = options.parent;

		this._id = false;
		this._object = false;
		this._document = false;

		this._clipboard = false;
	};

	inews.property.event.Event.instance = false;

	inews.property.event.Event.create = function (parent) {
		var instance = inews.property.event.Event.instance;
		var div, ul;
		var table, thead, tr;

		if (!instance) {
			inews.property.event.Event.instance = instance = new inews.property.event.Event({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-event-title').addClass('title').html(MESSAGE['IA_EVENT']).appendTo(instance._parentEl);

		// event-tool
		ul = $('<ul></ul>').addClass('ia-event-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-add').attr('title', MESSAGE['IA_EVENT_TOOLTOP_ADD'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-modify').attr('title', MESSAGE['IA_EVENT_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-preview').attr('title', MESSAGE['IA_EVENT_TOOLTOP_PREVIEW'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-copy').attr('title', MESSAGE['IA_EVENT_TOOLTOP_COPY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-paste').attr('title', MESSAGE['IA_EVENT_TOOLTOP_PASTE'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-event-tool-delete').attr('title', MESSAGE['IA_EVENT_TOOLTOP_DELETE'])
		).appendTo(ul);

		// selected object id
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['SELECTED_OBJECT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-event-select').attr('type', 'text').attr('disabled', true).appendTo(div);

		// event list header
		table = $('<table></table>').addClass('ia-event-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_EVENT_LIST_HEADER_ID']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_EVENT_LIST_HEADER_EVENT']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_EVENT_LIST_HEADER_ACTION']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_EVENT_LIST_HEADER_TARGET_OBJECT']).appendTo(tr);

		// event list
		$('<tbody></tbody>').appendTo(table);

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-event-list .ia-event-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			$('.ia-event-list .ia-event-item').removeClass('selected');
			$(this).addClass('selected');

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-event-list .ia-event-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			$('.ia-event-list .ia-event-item').removeClass('selected');
			$(this).addClass('selected');

			instance._onModify();

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_DOCUMENT_UPDATE, function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onSelect(e);

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_SELECT, function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onSelect(e);
		});
		$(instance._parentEl).find('.ia-event-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			switch (id) {
				case 'btn-ia-event-tool-add':
					instance._onAdd();
					break;
				case 'btn-ia-event-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-event-tool-preview':
					instance._onPreview();
					break;
				case 'btn-ia-event-tool-copy':
					instance._onCopy();
					break;
				case 'btn-ia-event-tool-paste':
					instance._onPaste();
					break;
				case 'btn-ia-event-tool-delete':
					instance._onDelete();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.event.Event.destroy = function () {
		var instance = inews.property.event.Event.instance;

		if (!instance) return;

		$(document).off(EVT_MOUSECLICK, '.ia-event-list .ia-event-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-event-list .ia-event-item');
		$(document).off(EVT_DOCUMENT_UPDATE);

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).find('.ia-event-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.event.Event.prototype._getEventId = function () {
		var id = 1;
		$('.ia-event-list tbody').find('tr').each(function (idx, val) {
			var vid = parseInt($(val).attr('data-event-id'));
			if (id <= vid) id = vid + 1;
		});
		return id;
	};

	inews.property.event.Event.prototype._onResize = function (e) {
		$(this).find('input#ia-event-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-event-list tr th:last-child, .ia-event-list tr td:last-child').width($(this).width() - (2 + (16 + 1 + 8) + (80 + 1 + 8) + (60 + 1 + 8) + 8) - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-event-list .empty td').width(inews.property.event.Event.instance._getRowWidth());
		$(this).find('.ia-event-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.event.Event.prototype._onSelect = function (e) {
		this._setObject($('.editor-area .object.selected'));

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.event.Event.prototype._setObject = function (obj) {
		if ($(obj).length == 1) {
			this._object = obj;
			this._document = false;
			this._id = $(obj).IObject('id');

			$('#ia-event-select').val(this._id);
		} else if ($(obj).length == 0) {
			this._object = false;
			this._id = false;

			if ($('.editor-area .editor').length > 0) {
				this._document = true;
				$('#ia-event-select').val(MESSAGE['IA_EVENT_SELECT_DOCUMENT']);
			} else {
				this._document = false;
				$('#ia-event-select').val('');
			}
		} else {
			this._object = false;
			this._document = false;
			this._id = false;

			$('#ia-event-select').val(MESSAGE['CONTROL_MULTISELECT_OBJID']);
		}
		this._reset();
	};

	inews.property.event.Event.prototype._getRowWidth = function () {
		var ths = $('.ia-event-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.event.Event.prototype._addEmptyRow = function () {
		var listEl = $('.ia-event-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.event.Event.prototype._reset = function () {
		var datas, dataCnt = 0;
		var self = this;

		$('.ia-event-list tbody').empty();
		this._addEmptyRow();

		if (this._object) {
			datas = $(this._object).IObject('getData', 'event');
			dataCnt = datas.length;
			$.each(datas, function (idx, val) {
				self._add(val, val.eventId);
			});
		} else if (this._document) {
			datas = $('.editor-area').IEditor('getData', 'event');
			dataCnt = datas.length;
			$.each(datas, function (idx, val) {
				self._add(val, val.eventId);
			});
		}
	};

	inews.property.event.Event.prototype._add = function (data, eventId) {
		var listEl = $(this._parentEl).find('.ia-event-list');
		var li, target, val;

		$(listEl).find('.empty').remove();

		if (eventId) {
			li = listEl.find('tr[data-event-id='+eventId+']');
			if (li.length < 1) {
				li = $('<tr></tr>').appendTo(listEl.find('tbody'));
				li.addClass('ia-event-item');
				li.attr('data-event-id', eventId);
			}
			li.empty();
		} else {
			data.eventId = this._getEventId();

			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-event-item');
			li.attr('data-event-id', data.eventId);
		}
		li.data(data);

		$('<td></td>').html(li.attr('data-event-id')).appendTo(li);
		switch (data.type) {
			case EVENT_TYPE_CLICK: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_CLICK']; break;
			case EVENT_TYPE_AFTER: val = MESSAGE['IA_EVENT_TYPE_EVENTTYPE_AFTER']; break;
			case EVENT_TYPE_CUSTOM: val = 'C:' + data.customevent; break;
			case EVENT_TYPE_SCROLL: val = 'S:' + data.eventpos[0] + data.eventpos[1]; break;
			default: val = 'U:' + data.type; break;
		}
		$('<td></td>').html(val).appendTo(li);

		switch (data.actiontype) {
			case EVENT_ACTION_TYPE_CHANGE_STYLE:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_STYLE'];
				target = data.targetObject;
				break;
			case EVENT_ACTION_TYPE_SCROLL_TO:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_SCROLL'];
				target = '' + data.position[0] + data.position[1];
				break;
			case EVENT_ACTION_TYPE_LINK:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_LINK'];
				target = data.url;
				break;
			case EVENT_ACTION_TYPE_PLAY:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_PLAY'];
				target = data.targetObject;
				break;
			case EVENT_ACTION_TYPE_FIREEVENT:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_FIREEVENT'];
				target = data.event + ' -> ' + data.targetObject;
				break;
			case EVENT_ACTION_TYPE_SCRIPT:
				val = MESSAGE['IA_EVENT_TYPE_ACTIONTYPE_SCRIPT'];
				target = data.script + '()';
				break;
			default:
				val = data.actiontype;
				target = '';
				break;
		}
		$('<td></td>').html(val).appendTo(li);
		$('<td></td>').html(target).width($(listEl).find('tr th:last-child').width()).appendTo(li);
	};

	inews.property.event.Event.prototype._onAdd = function () {
		var dlg, data = {};
		var self = this;

		if (!this._object && !this._document) return;

		dlg = new inews.property.event.EventTypeDlg({
			id: 'ia-event-type',
			isDocument: this._document
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			var SubDlgClass, subDlg;

			if (action != BTN_OK) return;

			data = dlg.getData();

			switch (data.actiontype) {
				case EVENT_ACTION_TYPE_CHANGE_STYLE:
					SubDlgClass = inews.property.event.EventStyleDlg;
					break;
				case EVENT_ACTION_TYPE_SCROLL_TO:
					SubDlgClass = inews.property.event.EventScrollToDlg;
					break;
				case EVENT_ACTION_TYPE_LINK:
					SubDlgClass = inews.property.event.EventLinkDlg;
					break;
				case EVENT_ACTION_TYPE_PLAY:
					SubDlgClass = inews.property.event.EventPlayDlg;
					break;
				case EVENT_ACTION_TYPE_FIREEVENT:
					SubDlgClass = inews.property.event.EventFireEventDlg;
					break;
				case EVENT_ACTION_TYPE_SCRIPT:
					SubDlgClass = inews.property.event.EventScriptDlg;
					break;
				default:
					return false;
			}

			subDlg = new SubDlgClass({
				id: 'ia-event-subdlg',
				obj: self._object
			});
			subDlg.getEl().one(EVT_BUTTONCLICK, function (e, subaction) {
				if (subaction == BTN_OK) {
					data = $.extend({}, data, subDlg.getData());

					self._add(data);
					self._sync();
				}
			});
		});
	};

	inews.property.event.Event.prototype._onDelete = function () {
		if (!this._object && !this._document) return;

		$(this._parentEl).find('.ia-event-list tr.selected').remove();
		this._addEmptyRow();
		this._sync();
	};

	inews.property.event.Event.prototype._onModify = function () {
		var dlg, li, eventId, data = {};
		var self = this;

		if (!this._object && !this._document) return;

		li = $(this._parentEl).find('.ia-event-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_EVENT_SELECTED_EVENT_NOT_FOUND']);
			return;
		}
		data = {
			eventId: li.data('eventId'),
			type: li.data('type'),
			actiontype: li.data('actiontype'),
			customevent: li.data('customevent'),
			eventpos: li.data('eventpos'),
			action: li.data('action'),
			datas: li.data('datas'),
			event: li.data('event'),
			position: li.data('position'),
			targetObject: li.data('targetObject'),
			eventRepeat: li.data('eventRepeat'),
			endEvent: li.data('endEvent'),
			script: li.data('script'),
			url: li.data('url')
		};
		dlg = new inews.property.event.EventTypeDlg({
			id: 'ia-event-type',
			isDocument: this._document,
			data: data
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			var SubDlgClass, subdlg;

			if (action != BTN_OK) return;

			data = $.extend({}, data, dlg.getData());
			eventId = data.eventId;

			switch (data.actiontype) {
				case EVENT_ACTION_TYPE_CHANGE_STYLE:
					SubDlgClass = inews.property.event.EventStyleDlg;
					break;
				case EVENT_ACTION_TYPE_SCROLL_TO:
					SubDlgClass = inews.property.event.EventScrollToDlg;
					break;
				case EVENT_ACTION_TYPE_LINK:
					SubDlgClass = inews.property.event.EventLinkDlg;
					break;
				case EVENT_ACTION_TYPE_PLAY:
					SubDlgClass = inews.property.event.EventPlayDlg;
					break;
				case EVENT_ACTION_TYPE_FIREEVENT:
					SubDlgClass = inews.property.event.EventFireEventDlg;
					break;
				case EVENT_ACTION_TYPE_SCRIPT:
					SubDlgClass = inews.property.event.EventScriptDlg;
					break;
				default:
					return false;
			}

			subdlg = new SubDlgClass({
				id: 'ia-event-subdlg',
				obj: self._object,
				data: data
			});
			subdlg.getEl().one(EVT_BUTTONCLICK, function (e, subaction) {
				if (subaction == BTN_OK) {
					data = $.extend({}, data, subdlg.getData());

					self._add(data, eventId);
					self._sync();
				}
			});
		});
	};

	inews.property.event.Event.prototype._onCopy = function () {
		var li, data = {};

		if (!this._object) return;

		li = $(this._parentEl).find('.ia-event-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_EVENT_SELECTED_EVENT_NOT_FOUND']);
			return;
		}
		data = {
			eventId: li.data('eventId'),
			type: li.data('type'),
			actiontype: li.data('actiontype'),
			customevent: li.data('customevent'),
			eventpos: li.data('eventpos'),
			action: li.data('action'),
			datas: li.data('datas'),
			event: li.data('event'),
			position: li.data('position'),
			targetObject: li.data('targetObject'),
			eventRepeat: li.data('eventRepeat'),
			endEvent: li.data('endEvent'),
			script: li.data('script'),
			url: li.data('url')
		};
		this._clipboard = $.JSON.encode(data);

		alert(MESSAGE['IA_EVENT_COPY_COMPLETE']);
	};

	inews.property.event.Event.prototype._onPaste = function () {
		var data;

		if (!this._object) return;

		data = $.JSON.decode(this._clipboard);
		this._add(data);
	};

	inews.property.event.Event.prototype._onPreview = function () {
		var dlg, li;

		if (!this._object && !this._document) return;

		li = $(this._parentEl).find('.ia-event-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_EVENT_SELECTED_EVENT_NOT_FOUND']);
			return;
		}
		dlg = new inews.property.event.EventPreviewDlg({
			eventId: li.data('eventId'),
			events: this.getData(),
			source: this._object
		});
	};

	inews.property.event.Event.prototype._sync = function () {
		var datas = this.getData();

		if (this._object) {
			$(this._object).IObject('setData', 'event', datas);
		} else if (this._document) {
			$('.editor-area').IEditor('setData', 'event', datas);
		}
	};

	inews.property.event.Event.prototype.getData = function () {
		var datas = [];

		$(this._parentEl).find('.ia-event-list .ia-event-item').each(function (idx, item) {
			datas.push({
				eventId: $(item).data('eventId'),
				type: $(item).data('type'),
				actiontype: $(item).data('actiontype'),
				customevent: $(item).data('customevent'),
				eventpos: $(item).data('eventpos'),
				action: $(item).data('action'),
				datas: $(item).data('datas'),
				event: $(item).data('event'),
				position: $(item).data('position'),
				targetObject: $(item).data('targetObject'),
				eventRepeat: $(item).data('eventRepeat'),
				endEvent: $(item).data('endEvent'),
				script: $(item).data('script'),
				url: $(item).data('url')
			});
		});
		return datas;
	};

	G_PROPERTY_LIST.push({
		id: 'ia-event',
		name: 'Event',
		'class': inews.property.event.Event,
		icon: 'images/property/event/icon.png'
	});
}(jQuery));