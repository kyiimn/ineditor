(function ($, undefined) {
	$.namespace('inews.property.animation');

	inews.property.animation.Animation = function (options) {
		this._parentEl = options.parent;
	};

	inews.property.animation.Animation.instance = false;

	inews.property.animation.Animation.create = function (parent) {
		var instance = inews.property.animation.Animation.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.animation.Animation.instance = instance = new inews.property.animation.Animation({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-animation-title').addClass('title').html(MESSAGE['IA_ANIMATION']).appendTo(instance._parentEl);

		// script-tool
		ul = $('<ul></ul>').addClass('ia-animation-tool').appendTo(instance._parentEl);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-tool-add').attr('title', MESSAGE['IA_ANIMATION_TOOLTOP_ADD'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-tool-modify').attr('title', MESSAGE['IA_ANIMATION_TOOLTOP_MODIFY'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-tool-preview').attr('title', MESSAGE['IA_ANIMATION_TOOLTOP_PREVIEW'])
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('separator')
		).appendTo(ul);
		$('<li></li>').append(
			$('<a></a>').addClass('button').attr('id', 'btn-ia-animation-tool-delete').attr('title', MESSAGE['IA_ANIMATION_TOOLTOP_DELETE'])
		).appendTo(ul);

		// script list header
		table = $('<table></table>').addClass('ia-animation-list').appendTo(instance._parentEl);
		thead = $('<thead></thead>').appendTo(table);
		tr = $('<tr></tr>').appendTo(thead);
		$('<th></th>').html(MESSAGE['IA_ANIMATION_LIST_HEADER_NAME']).appendTo(tr);

		// script list
		$('<tbody></tbody>').appendTo(table);

		instance._reset();

		// set event handler
		$(document).on(EVT_MOUSECLICK, '.ia-animation-list .ia-animation-item', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance.selectItem(this);

			e.preventDefault();
			e.stopPropagation();
		});
		$(document).on(EVT_MOUSEDBLCLICK, '.ia-animation-list .ia-animation-item', function (e) {
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
		$(instance._parentEl).find('.ia-animation-tool .button').on(EVT_MOUSECLICK, function (e) {
			var id = $(this).attr('id');

			if (G_PROPERTY_LOCK) return;

			if ($('.editor-area .editor').length < 1) return;

			switch (id) {
				case 'btn-ia-animation-tool-add':
					instance._onAdd();
					break;
				case 'btn-ia-animation-tool-modify':
					instance._onModify();
					break;
				case 'btn-ia-animation-tool-delete':
					instance._onDelete();
					break;
				case 'btn-ia-animation-tool-preview':
					instance._onPreview();
					break;
			}
			e.preventDefault();
			e.stopPropagation();
		});
	};

	inews.property.animation.Animation.destroy = function () {
		var instance = inews.property.animation.Animation.instance;

		if (!instance) return;

		$(document).off(EVT_MOUSECLICK, '.ia-animation-list .ia-animation-item');
		$(document).off(EVT_MOUSEDBLCLICK, '.ia-animation-list .ia-animation-item');

		$(document).off(EVT_DOCUMENT_UPDATE);

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).find('.ia-animation-tool .button').off(EVT_MOUSECLICK);

		$(instance._parentEl).empty();
	};

	inews.property.animation.Animation.prototype.selectItem = function (item) {
		var img, imgSrc;
		var self = this;

		$('.ia-animation-list .ia-animation-item').removeClass('selected');
		$(item).addClass('selected');
	};

	inews.property.animation.Animation.prototype._onResize = function (e) {
		$(this).find('input#ia-animation-select').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('.ia-animation-list tr th, .ia-animation-list tr td').width($(this).width() - 10 - G_PROPERTY_SCROLLBAR_SIZE);

		$(this).find('.ia-animation-list .empty td').width(inews.property.animation.Animation.instance._getRowWidth());
		$(this).find('.ia-animation-list').width($(this).width() - 1 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.animation.Animation.prototype._getRowWidth = function () {
		var ths = $('.ia-animation-list thead th');
		var width = 0;

		ths.each(function (idx, th) {
			width += $(th).outerWidth();
		});
		return width - parseInt($(ths[0]).css('padding-right')) - parseInt($(ths[ths.length - 1]).css('padding-left')) - 2;
	};

	inews.property.animation.Animation.prototype._addEmptyRow = function () {
		var listEl = $('.ia-animation-list');
		var tbody = $(listEl).find('tbody');
		var colCnt = $(listEl).find('thead th').length;

		if ($(tbody).find('> *').length > 0) return;

		$('<tr><td colspan="' + colCnt + '">&nbsp;</td></tr>').addClass('empty').appendTo(tbody).find('td').width(this._getRowWidth());
	};

	inews.property.animation.Animation.prototype._reset = function () {
		var data, itemCnt = 0;
		var self = this;

		$('.ia-animation-list tbody').empty();
		this._addEmptyRow();

		if ($('.editor-area .editor').length < 1) return;

		data = $('.editor-area').IEditor('getData', 'animation');

		itemCnt = data.length;
		$.each(data, function (idx, item) {
			self._add({
				name: item.name,
				datas: item.datas,
				targetObject: item.targetObject
			});
		});
	};

	inews.property.animation.Animation.prototype._add = function (data) {
		var listEl = $(this._parentEl).find('.ia-animation-list');
		var li, encodedName = MD5(data.name);

		$(listEl).find('.empty').remove();

		li = listEl.find('tr[data-name='+encodedName+']');
		if (li.length < 1) {
			li = $('<tr></tr>').appendTo(listEl.find('tbody'));
			li.addClass('ia-animation-item');
			li.attr('data-name', encodedName);
		}
		li.empty();
		li.data('name', data.name);
		li.data('datas', data.datas);
		li.data('targetObject', data.targetObject);

		$('<td></td>').html(data.name).width($(listEl).find('tr th:nth-child(1)').width()).appendTo(li);

		return true;
	};

	inews.property.animation.Animation.prototype._onAdd = function (type) {
		var dlg, self = this;

		dlg = new inews.property.animation.AnimationEditorDlg({
			id: 'ia-animation-add'
		});
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					datas: data.datas,
					targetObject: data.targetObject
				});
				self._sync();
			}
		});
	};

	inews.property.animation.Animation.prototype._onModify = function () {
		var dlg, dlgOption, li;
		var self = this;

		li = $(this._parentEl).find('.ia-animation-list tr.selected');
		if (li.length < 1) {
			alert(MESSAGE['IA_ANIMATION_SELECTED_ANIMATION_NOT_FOUND']);
			return;
		}

		dlgOption = {
			id: 'ia-animation-modify',
			data: {
				name: li.data('name'),
				datas: li.data('datas'),
				targetObject: li.data('targetObject')
			}
		};
		dlg = new inews.property.animation.AnimationEditorDlg(dlgOption);
		dlg.getEl().one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				self._add({
					name: data.name,
					datas: data.datas,
					targetObject: data.targetObject
				});
				self._sync();
			}
		});
	};

	inews.property.animation.Animation.prototype._onDelete = function () {
		$(this._parentEl).find('.ia-animation-list tr.selected').remove();
		this._addEmptyRow();
		this._sync();
	};

	inews.property.animation.Animation.prototype._onPreview = function () {
		var li = $(this._parentEl).find('.ia-animation-list tr.selected');
		var dlg, data;

		if (li.length < 1) {
			alert(MESSAGE['IA_ANIMATION_SELECTED_ANIMATION_NOT_FOUND']);
			return;
		}
		data = {
			name: $(li).data('name'),
			datas: $(li).data('datas'),
			targetObject: $(li).data('targetObject')
		};
		dlg = new inews.property.animation.AnimationPreviewDlg({
			id: 'ia-animation-preview',
			data: data
		});
	};

	inews.property.animation.Animation.prototype._sync = function () {
		var data = [];

		$(this._parentEl).find('.ia-animation-list tr.ia-animation-item').each(function (idx, val) {
			data.push({
				name: $(this).data('name'),
				datas: $(this).data('datas'),
				targetObject: $(this).data('targetObject')
			});
		});
		$('.editor-area').IEditor('setData', 'animation', data)

		controlStyleResetAnimationName();
	};

	G_PROPERTY_LIST.push({
		id: 'ia-animation',
		name: 'Animation',
		'class': inews.property.animation.Animation,
		icon: 'images/property/animation/icon.png'
	});
}(jQuery));