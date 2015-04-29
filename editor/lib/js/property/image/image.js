(function ($, undefined) {
	$.namespace('inews.property.image');

	inews.property.image.Image = function (options) {
		this._options = options;
		this._parentEl = options.parent;

		this._id = false;
		this._object = false;
	};

	inews.property.image.Image.instance = false;

	inews.property.image.Image.create = function (parent) {
		var instance = inews.property.image.Image.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.image.Image.instance = instance = new inews.property.image.Image({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-image-title').addClass('title').html(MESSAGE['IA_IMAGE']).appendTo(instance._parentEl);

		// image-tool
		ul = $('<ul></ul>').addClass('ia-image-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-image-tool-add').attr('title', MESSAGE['IA_IMAGE_TOOLTOP_ADD'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-image-tool-modify').attr('title', MESSAGE['IA_IMAGE_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-image-tool-delete').attr('title', MESSAGE['IA_IMAGE_TOOLTOP_DELETE'])
		).appendTo(ul);

		// selected object id
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['SELECTED_OBJECT']).appendTo(div);
		$('<input></input>').attr('id', 'ia-image-select').attr('type', 'text').attr('disabled', true).appendTo(div);

		// action type (slide)
		div = $('<div></div>').addClass('field').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_IMAGE_ACTIONTYPE']).appendTo(div);
		select = $('<select></select>').attr('id', 'ia-image-actiontype').appendTo(div);
		$('<option></option>').val(OBJECT_IMAGE_ACTIONTYPE_SWIPE_SCROLL).html(MESSAGE['IA_IMAGE_ACTIONTYPE_SWIPE_SCROLL']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_ACTIONTYPE_CLICK_SCROLL).html(MESSAGE['IA_IMAGE_ACTIONTYPE_CLICK_SCROLL']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_ACTIONTYPE_CLICK_CHANGE).html(MESSAGE['IA_IMAGE_ACTIONTYPE_CLICK_CHANGE']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_ACTIONTYPE_EVENT_SCROLL).html(MESSAGE['IA_IMAGE_ACTIONTYPE_EVENT_SCROLL']).appendTo(select);
		$('<option></option>').val(OBJECT_IMAGE_ACTIONTYPE_EVENT_CHANGE).html(MESSAGE['IA_IMAGE_ACTIONTYPE_EVENT_CHANGE']).appendTo(select);

		// image previewer
		$('<div></div>').addClass('ia-image-preview').appendTo(instance._parentEl);

		// image list header
		table = $('<table></table>').addClass('ia-image-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_IMAGE_LIST_HEADER_NAME']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_IMAGE_LIST_HEADER_TYPE']).appendTo(tr);
		$('<th></th>').html(MESSAGE['IA_IMAGE_LIST_HEADER_FILLTYPE']).appendTo(tr);

		// image list
		$('<tbody></tbody>').appendTo(table);
		$('.ia-image-list tbody').sortable({
			axis: 'y',
			placeholder: 'empty-highlight'
		});
		$('.ia-image-list tbody').on(EVT_SORTUPDATE, function () {
			instance._sync();
		});

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-image-list .ia-image-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-image-list .ia-image-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);
			instance._onModify();

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_CHANGE, '.field select', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._sync();

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_UPDATE, function (e) {
			var oldSelected = $('.ia-image-list .ia-image-item.selected').attr('data-name');
			instance._reset();
			if (oldSelected) $('.ia-image-list').find('tr[data-name='+oldSelected+']').trigger(EVT_MOUSECLICK);
		});
		$(instance._parentEl).on(EVT_SELECT, function (e) { instance._onSelect(e); });
		$(instance._parentEl).find('.ia-image-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			switch (id) {
				case 'btn-ia-image-tool-add':
					instance._onAdd();
					break;
				case 'btn-ia-image-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-image-tool-delete':
					instance._onDelete();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.image.Image.destroy = function () {
		var instance = inews.property.image.Image.instance;

		if (!instance) return;

		$('.ia-image-list tbody').sortable('destroy');

		$('.ia-image-list tbody').off(EVT_SORTUPDATE);

		$(document).off(EVT_MOUSECLICK, '.ia-image-list .ia-image-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-image-list .ia-image-item');

		$(instance._parentEl).off(EVT_CHANGE);
		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_UPDATE);
		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).find('.ia-image-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.image.Image.prototype.selectItem = function (item) {
		var img, imgSrc;
		var self = this;
		var data = {
			name: $(item).data('name'),
			type: $(item).data('type'),
			fill: $(item).data('fill')
		};

		$('.ia-image-list .ia-image-item').removeClass('selected');
		$(item).addClass('selected');

		$('.ia-image-preview').empty();

		img = $('<img></img>');
		img.appendTo($('.ia-image-preview'));

		switch (data.type) {
			case OBJECT_IMAGE_ITEMTYPE_SERVER:
				imgSrc = pathGetImage(data.name);
				break;
			case OBJECT_IMAGE_ITEMTYPE_LINK:
			default:
				imgSrc = data.name;
				break;
		}
		img.load(function () {
			$(this).data('loaded', true);
			$(self._parentEl).trigger(EVT_RESIZE);
		});
		img.attr('src', imgSrc);
	};

	inews.property.image.Image.prototype._onResize = function (e) {
		var img, imgH, previewH;

		$(this).find('input#ia-image-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('select#ia-image-actiontype').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-image-preview').width($(this).width() - 2 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-image-list tr th:first-child, .ia-image-list tr td:first-child').width($(this).width() - (2 + (50 + 1 + 8) + (70 + 1 + 8) + 8) - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-image-list .empty td').width(inews.property.image.Image.instance._getRowWidth());
		$(this).find('.ia-image-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		img = $(this).find('.ia-image-preview img');
		if (img.length > 0) {
			imgH = $(this).find('.ia-image-preview img').height();
			previewH = $(this).find('.ia-image-preview').height();

			if (previewH > imgH) {
				$(img).css('margin-top', Math.floor((previewH - imgH) / 2));
			} else {
				$(img).css('margin-top', 0);
			}
		}
		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.image.Image.prototype._getRowWidth = function () {
		var ths = $('.ia-image-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.image.Image.prototype._addEmptyRow = function () {
		var listEl = $('.ia-image-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.image.Image.prototype._onSelect = function (e) {
		this._setObject($('.editor-area .object.selected'));

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.image.Image.prototype._setObject = function (obj) {
		if ($(obj).length == 1) {
			if ($(obj).IObject('getType') != OBJECT_TYPE_IMAGE) {
				this._object = false;
				this._id = false;

				$('#ia-image-select').val(MESSAGE['IA_IMAGE_INVALID_OBJECT_TYPE']);
			} else {
				this._object = obj;
				this._id = $(obj).IObject('id');

				$('#ia-image-select').val(this._id);
			}
		} else {
			this._object = false;
			this._id = false;

			if ($(obj).length > 1) {
				$('#ia-image-select').val(MESSAGE['CONTROL_MULTISELECT_OBJID']);
			} else {
				$('#ia-image-select').val('');
			}
		}
		this._reset();

		$('.ia-image-list').find('tr:first-child').trigger(EVT_MOUSECLICK);
	};

	inews.property.image.Image.prototype._reset = function () {
		var data, itemCnt = 0;
		var self = this;

		$('.ia-image-list tbody').empty();
		this._addEmptyRow();

		$('.ia-image-preview').empty();
		$('#ia-image-actiontype').val('');

		if (this._object) {
			data = $(this._object).IObject('getData', OBJECT_TYPE_IMAGE);
			$('#ia-image-actiontype').val(data.actionType);

			itemCnt = data.list.length;
			$.each(data.list, function (idx, item) {
				self._add({
					name: item.name,
					type: item.type,
					fill: item.fill
				});
			});
		}
	};

	inews.property.image.Image.prototype._add = function (data) {
		var listEl = $(this._parentEl).find('.ia-image-list');
		var li, target, fillType, locType;
		var encodedName = MD5(data.name);

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-name='+encodedName+']');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-image-item');
			li.attr('data-name', encodedName);
		}
		li.empty();
		li.data({
			name: data.name,
			type: data.type,
			fill: data.fill
		});

		$('<td></td>').html(data.name).width($(listEl).find('tr th:first-child').width()).appendTo(li);

		switch (data.type) {
			case OBJECT_IMAGE_ITEMTYPE_SERVER:
				locType = MESSAGE['IA_IMAGE_LOCATION_SERVER'];
				break;
			case OBJECT_IMAGE_ITEMTYPE_LINK:
			default:
				locType = MESSAGE['IA_IMAGE_LOCATION_LINK'];
				break;
		}
		$('<td></td>').html(locType).appendTo(li);

		switch (data.fill) {
			case OBJECT_IMAGE_FILLTYPE_AUTOFIT_INNER:
				fillType = MESSAGE['IA_IMAGE_FILLTYPE_AUTOFIT_INNER'];
				break;
			case OBJECT_IMAGE_FILLTYPE_AUTOFIT_OUTER:
				fillType = MESSAGE['IA_IMAGE_FILLTYPE_AUTOFIT_OUTER'];
				break;
			case OBJECT_IMAGE_FILLTYPE_FILL:
			default:
				fillType = MESSAGE['IA_IMAGE_FILLTYPE_FILL'];
				break;
		}
		$('<td></td>').html(fillType).appendTo(li);

		return true;
	};

	inews.property.image.Image.prototype._onAdd = function () {
		var dlg, self = this;

		if (!this._object) return;

		dlg = new inews.property.image.ImagePropertyDlg({ id: 'ia-image-add' });
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					type: data.type,
					fill: data.fill
				});
				self._sync();
			}
		});
	};

	inews.property.image.Image.prototype._onDelete = function () {
		if (!this._object) return;

		$(this._parentEl).find('.ia-image-list tr.selected').remove();
		$(this._parentEl).find('.ia-image-preview').empty();
		this._addEmptyRow();
		this._sync();
	};

	inews.property.image.Image.prototype._onModify = function () {
		var dlg, li;
		var self = this;

		li = $(this._parentEl).find('.ia-image-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_IMAGE_SELECTED_IMAGE_NOT_FOUND']);
			return;
		}

		dlg = new inews.property.image.ImagePropertyDlg({
			id: 'ia-image-modify',
			data: {
				name: li.data('name'),
				type: li.data('type'),
				fill: li.data('fill'),
			}
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					type: data.type,
					fill: data.fill
				});
				self._sync();

				dlg.close();
			}
		});
	};

	inews.property.image.Image.prototype._sync = function () {
		var data, items = [];

		$(this._parentEl).find('.ia-image-list tr.ia-image-item').each(function (idx, item) {
			items.push({
				name: $(item).data('name'),
				type: $(item).data('type'),
				fill: $(item).data('fill')
			});
		});
		data = {
			actionType: $('#ia-image-actiontype').val(),
			list: items
		};
		$(this._object).IObject('setData', OBJECT_TYPE_IMAGE, data);
		$(this._object).trigger(EVT_REDRAW);
	};

	G_PROPERTY_LIST.push({
		id: 'ia-image',
		name: 'Image',
		'class': inews.property.image.Image,
		icon: 'images/property/image/icon.png'
	});
}(jQuery));