(function ($, undefined) {
	$.namespace('inews.property.script');

	inews.property.script.Script = function (options) {
		this._parentEl = options.parent;
	};

	inews.property.script.Script.instance = false;

	inews.property.script.Script.create = function (parent) {
		var instance = inews.property.script.Script.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.script.Script.instance = instance = new inews.property.script.Script({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-script-title').addClass('title').html(MESSAGE['IA_SCRIPT']).appendTo(instance._parentEl);

		// script-tool
		ul = $('<ul></ul>').addClass('ia-script-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-script-tool-add-source').attr('title', MESSAGE['IA_SCRIPT_TOOLTOP_ADD_SOURCE'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-script-tool-add-link').attr('title', MESSAGE['IA_SCRIPT_TOOLTOP_ADD_LINK'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-script-tool-modify').attr('title', MESSAGE['IA_SCRIPT_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-script-tool-delete').attr('title', MESSAGE['IA_SCRIPT_TOOLTOP_DELETE'])
		).appendTo(ul);

		// script list header
		table = $('<table></table>').addClass('ia-script-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_SCRIPT_LIST_HEADER_NAME']).appendTo(tr);

		// script list
		$('<tbody></tbody>').appendTo(table);

		instance._reset();

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-script-list .ia-script-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-script-list .ia-script-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);
			instance._onModify();

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_DOCUMENT_UPDATE, function (e) {
			instance._reset();
		});
		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).find('.ia-script-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			if ($('.editor-area .editor').length < 1) return;

			switch (id) {
				case 'btn-ia-script-tool-add-source':
					instance._onAdd('source');
					break;
				case 'btn-ia-script-tool-add-link':
					instance._onAdd('link');
					break;
				case 'btn-ia-script-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-script-tool-delete':
					instance._onDelete();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.script.Script.destroy = function () {
		var instance = inews.property.script.Script.instance;

		if (!instance) return;

		$(document).off(EVT_MOUSECLICK, '.ia-script-list .ia-script-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-script-list .ia-script-item');

		$(document).off(EVT_DOCUMENT_UPDATE);

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).find('.ia-script-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.script.Script.prototype.selectItem = function (item) {
		var img, imgSrc;
		var self = this;

		$('.ia-script-list .ia-script-item').removeClass('selected');
		$(item).addClass('selected');
	};

	inews.property.script.Script.prototype._onResize = function (e) {
		$(this).find('input#ia-script-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-script-list tr th, .ia-script-list tr td').width($(this).width() - 10 - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-script-list .empty td').width(inews.property.script.Script.instance._getRowWidth());
		$(this).find('.ia-script-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.script.Script.prototype._getRowWidth = function () {
		var ths = $('.ia-script-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.script.Script.prototype._addEmptyRow = function () {
		var listEl = $('.ia-script-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.script.Script.prototype._reset = function () {
		var data, itemCnt = 0;
		var self = this;

		$('.ia-script-list tbody').empty();
		this._addEmptyRow();

		if ($('.editor-area .editor').length < 1) return;

		data = $('.editor-area').IEditor('getData', 'script');

		itemCnt = data.length;
		$.each(data, function (idx, item) {
			self._add({
				name: item.name,
				source: item.source,
				type: item.type
			});
		});
	};

	inews.property.script.Script.prototype._add = function (data) {
		var listEl = $(this._parentEl).find('.ia-script-list');
		var li, encodedName = MD5(data.name);

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-name='+encodedName+']');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-script-item');
			li.attr('data-name', encodedName);
		}
		li.empty();
		li.data('name', data.name);
		li.data('source', data.source);
		li.data('type', data.type);

		switch (data.type) {
			case 'link':
				$('<td></td>').html(data.name).width($(listEl).find('tr th:nth-child(1)').width()).appendTo(li);
				break;

			case 'source':
			default:
				$('<td></td>').html(data.name + '()').width($(listEl).find('tr th:nth-child(1)').width()).appendTo(li);
				break;
		}
		return true;
	};

	inews.property.script.Script.prototype._onAdd = function (type) {
		var dlg, self = this;

		switch (type) {
			case 'link':
				dlg = new inews.property.script.ScriptLinkDlg({ id: 'ia-script-add' });
				break;
			case 'source':
			default:
				dlg = new inews.property.script.ScriptEditorDlg({ id: 'ia-script-add' });
				break;
		}
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					source: data.source,
					type: data.type
				});
				self._sync();
			}
		});
	};

	inews.property.script.Script.prototype._onModify = function () {
		var dlg, dlgOption, li;
		var self = this;

		li = $(this._parentEl).find('.ia-script-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_SCRIPT_SELECTED_SCRIPT_NOT_FOUND']);
			return;
		}

		dlgOption = {
			id: 'ia-script-modify',
			data: {
				name: li.data('name'),
				source: li.data('source'),
				type: li.data('type')
			}
		};

		switch (li.data('type')) {
			case 'link':
				dlg = new inews.property.script.ScriptLinkDlg(dlgOption);
				break;

			case 'source':
			default:
				dlg = new inews.property.script.ScriptEditorDlg(dlgOption);
				break;
		}

		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					source: data.source,
					type: data.type
				});
				self._sync();
			}
		});
	};

	inews.property.script.Script.prototype._onDelete = function () {
		$(this._parentEl).find('.ia-script-list tr.selected').remove();
		this._addEmptyRow();
		this._sync();
	};

	inews.property.script.Script.prototype._sync = function () {
		var data = [];

		$(this._parentEl).find('.ia-script-list tr.ia-script-item').each(function (idx, val) {
			data.push({
				name: $(this).data('name'),
				source: $(this).data('source'),
				type: $(this).data('type')
			});
		});
		$('.editor-area').IEditor('setData', 'script', data)
	};

	G_PROPERTY_LIST.push({
		id: 'ia-script',
		name: 'Script',
		'class': inews.property.script.Script,
		icon: 'images/property/script/icon.png'
	});
}(jQuery));