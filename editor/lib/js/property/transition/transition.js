(function ($, undefined) {
	$.namespace('inews.property.transition');

	inews.property.transition.Transition = function (options) {
		this._options = options;
		this._parentEl = options.parent;

		this._id = false;
		this._object = false;

		this._clipboard = false;
	};

	inews.property.transition.Transition.instance = false;

	inews.property.transition.Transition.create = function (parent) {
		var instance = inews.property.transition.Transition.instance;
		var div, ul;

		if (!instance) {
			inews.property.transition.Transition.instance = instance = new inews.property.transition.Transition({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-transition-title').addClass('title').html(MESSAGE['IA_TRANSITION']).appendTo(instance._parentEl);

		// transition-tool
		ul = $('<ul></ul>').addClass('ia-transition-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-add').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_ADD'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-modify').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-preview').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_PREVIEW'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-copy').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_COPY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-paste').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_PASTE'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-transition-tool-delete').attr('title', MESSAGE['IA_TRANSITION_TOOLTOP_DELETE'])
		).appendTo(ul);

		// selected object id
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['SELECTED_OBJECT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-transition-select').attr('type', 'text').attr('disabled', true).appendTo(div);

		// transition list header
		table = $('<table></table>').addClass('ia-transition-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_TRANSITION_LIST_HEADER_PROPERTY']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_TRANSITION_LIST_HEADER_DURATION']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_TRANSITION_LIST_HEADER_TIMING']).appendTo(tr);

		// transition list
		$('<tbody></tbody>').appendTo(table);

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-transition-list .ia-transition-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			$('.ia-transition-list .ia-transition-item').removeClass('selected');
			$(this).addClass('selected');

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-transition-list .ia-transition-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			$('.ia-transition-list .ia-transition-item').removeClass('selected');
			$(this).addClass('selected');

			instance._onModify();

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_SELECT, function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onSelect(e);
		});
		$(instance._parentEl).find('.ia-transition-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			switch (id) {
				case 'btn-ia-transition-tool-add':
					instance._onAdd();
					break;
				case 'btn-ia-transition-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-transition-tool-preview':
					instance._onPreview();
					break;
				case 'btn-ia-transition-tool-copy':
					instance._onCopy();
					break;
				case 'btn-ia-transition-tool-paste':
					instance._onPaste();
					break;
				case 'btn-ia-transition-tool-delete':
					instance._onDelete();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.transition.Transition.destroy = function () {
		var instance = inews.property.transition.Transition.instance;

		if (!instance) return;

		$(document).off(EVT_MOUSECLICK, '.ia-transition-list .ia-transition-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-transition-list .ia-transition-item');

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).find('.ia-transition-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.transition.Transition.prototype._onResize = function (e) {
		$(this).find('input#ia-transition-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-transition-list tr th:last-child, .ia-transition-list tr td:last-child').width($(this).width() - (2 + (100 + 1 + 8) + (60 + 1 + 8) + 8) - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-transition-list .empty td').width(inews.property.transition.Transition.instance._getRowWidth());
		$(this).find('.ia-transition-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.transition.Transition.prototype._getRowWidth = function () {
		var ths = $('.ia-transition-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.transition.Transition.prototype._addEmptyRow = function () {
		var listEl = $('.ia-transition-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.transition.Transition.prototype._onSelect = function (e) {
		this._setObject($('.editor-area .object.selected'));

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.transition.Transition.prototype._setObject = function (obj) {
		if ($(obj).length == 1) {
			this._object = obj;
			this._id = $(obj).IObject('id');

			$('#ia-transition-select').val(this._id);
		} else {
			this._object = false;
			this._id = false;

			if ($(obj).length > 1) {
				$('#ia-transition-select').val(MESSAGE['CONTROL_MULTISELECT_OBJID']);
			} else {
				$('#ia-transition-select').val('');
			}
		}
		this._reset(true);
	};

	inews.property.transition.Transition.prototype._reset = function (disableSync) {
		var datas, dataCnt = 0;
		var self = this;

		$('.ia-transition-list tbody').empty();
		this._addEmptyRow();

		if (this._object) {
			if (disableSync == undefined) disableSync = false;

			datas = $(this._object).IObject('getData', 'transition');
			dataCnt = datas.length;
			$.each(datas, function (idx, data) {
				self._add({
					property: data.property,
					duration: data.duration,
					timing: data.timing
				}, disableSync);
			});
		}
	};

	inews.property.transition.Transition.prototype._add = function (data, disableSync) {
		var listEl = $(this._parentEl).find('.ia-transition-list');
		var li, target;

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-property='+data.property+']');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-transition-item');
			li.attr('data-property', data.property);
		}
		li.empty();
		li.data({
			property: data.property,
			duration: data.duration,
			timing: data.timing
		});

		$('<td></td>').html(data.property).appendTo(li);
		$('<td></td>').html(data.duration).appendTo(li);
		$('<td></td>').html(data.timing).width($(listEl).find('tr th:last-child').width()).appendTo(li);

		if (!disableSync) this._sync();

		return true;
	};

	inews.property.transition.Transition.prototype._onAdd = function () {
		if (!this._object) return;

		new inews.property.transition.TransitionAddDlg({
			id: 'ia-transition-add',
			transition: this
		});
	};

	inews.property.transition.Transition.prototype._onDelete = function () {
		if (!this._object) return;

		$(this._parentEl).find('.ia-transition-list tr.selected').remove();
		this._addEmptyRow();
		this._sync();
	};

	inews.property.transition.Transition.prototype._onModify = function () {
		var li, data = {};

		li = $(this._parentEl).find('.ia-transition-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_TRANSITION_SELECTED_TRANSITION_NOT_FOUND']);
			return;
		}

		new inews.property.transition.TransitionAddDlg({
			id: 'ia-transition-add',
			transition: this,
			data: {
				property: li.data('property'),
				duration: li.data('duration'),
				timing: li.data('timing')
			}
		});
	};

	inews.property.transition.Transition.prototype._onCopy = function () {
		var li, data = {};

		if (!this._object) return;

		li = $(this._parentEl).find('.ia-transition-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_TRANSITION_SELECTED_TRANSITION_NOT_FOUND']);
			return;
		}
		data = {
			property: li.data('property'),
			duration: li.data('duration'),
			timing: li.data('timing')
		};
		this._clipboard = $.JSON.encode(data);

		alert(MESSAGE['IA_TRANSITION_COPY_COMPLETE']);
	};

	inews.property.transition.Transition.prototype._onPaste = function () {
		var data;

		if (!this._object) return;

		data = $.JSON.decode(this._clipboard);
		this._add(data);
	};

	inews.property.transition.Transition.prototype._onPreview = function () {
		var li;

		if (!this._object) return;

		li = $(this._parentEl).find('.ia-transition-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_TRANSITION_SELECTED_TRANSITION_NOT_FOUND']);
			return;
		}

		new inews.property.transition.TransitionPreviewDlg({
			id: 'ia-transition-preview',
			data: {
				property: li.data('property'),
				duration: li.data('duration'),
				timing: li.data('timing')
			}
		});
	};

	inews.property.transition.Transition.prototype._sync = function () {
		var datas = [];
		$(this._parentEl).find('.ia-transition-list tr.ia-transition-item').each(function (idx, val) {
			datas.push({
				property: $(this).data('property'),
				duration: $(this).data('duration'),
				timing: $(this).data('timing')
			});
		});
		$(this._object).IObject('setData', 'transition', datas);
	};

	inews.property.transition.Transition.prototype.getProperty = function () {
		var property = [];
		$(this._parentEl).find('.ia-transition-list tr.ia-transition-item').each(function (idx, val) {
			property.push($(this).data('property'));
		});
		return property;
	};

	G_PROPERTY_LIST.push({
		id: 'ia-transition',
		name: 'Transition',
		'class': inews.property.transition.Transition,
		icon: 'images/property/transition/icon.png'
	});
}(jQuery));