(function ($, undefined) {
	$.namespace('inews.property.document');

	inews.property.document.Document = function (options) {
		this._parentEl = options.parent;
	};

	inews.property.document.Document.instance = false;

	inews.property.document.Document.create = function (parent) {
		var instance = inews.property.document.Document.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.document.Document.instance = instance = new inews.property.document.Document({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-document-title').addClass('title').html(MESSAGE['IA_DOCUMENT']).appendTo(instance._parentEl);

		$('<div></div>').addClass('field').appendTo(instance._parentEl); // empty

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_NAME']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-name').attr('type', 'text').attr('readonly', true).appendTo(div);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_EDITOR_STATUS']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-editor-status').attr('type', 'text').attr('readonly', true).appendTo(div);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_RATIO']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-ratio').attr('type', 'text').attr('readonly', true).appendTo(div);

		$('<hr></hr>').appendTo(instance._parentEl);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_BACKGROUND_IMAGE']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-bgimage').attr('type', 'text').attr('data-style', 'background-image').attr('readonly', true).appendTo(div);
		$('<button></button>').attr('id', 'ia-document-bgimage-select').html('Browser').appendTo(div);
		$('<button></button>').attr('id', 'ia-document-bgimage-clear').addClass('small').html('X').appendTo(div);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_BACKGROUND_REPEAT']).appendTo(div);
		select = $('<select></select>').attr('id', 'ia-document-bgimage-repeat').appendTo(div);
		$('<option></option>').val('repeat').html('XY').appendTo(select);
		$('<option></option>').val('repeat-x').html('X').appendTo(select);
		$('<option></option>').val('repeat-y').html('Y').appendTo(select);
		$('<option></option>').val('no-repeat').html('none').appendTo(select);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_BACKGROUND_SIZE']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-bgimage-size').attr('type', 'text').attr('data-style', 'background-size').appendTo(div);
		select = $('<select></select>').attr('id', 'ia-document-bgimage-size-unit').attr('data-style', 'background-size').addClass('unit').appendTo(div);
		$('<option></option>').val('px').html('px').appendTo(select);
		$('<option></option>').val('%').html('%').appendTo(select);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_BACKGROUND_ATTACH']).appendTo(div);
		select = $('<select></select>').attr('id', 'ia-document-bgimage-attach').attr('data-style', 'background-attachment').appendTo(div);
		$('<option></option>').val('scroll').html('Scroll').appendTo(select);
		$('<option></option>').val('fixed').html('Fixed').appendTo(select);
		$('<option></option>').val('local').html('Local').appendTo(select);

		div = $('<div></div>').addClass('field').addClass('ia-document').appendTo(instance._parentEl);
		$('<label></label>').html(MESSAGE['IA_DOCUMENT_BACKGROUND_COLOR']).appendTo(div);
		$('<input></input>').attr('id', 'ia-document-bgcolor').attr('type', 'text').attr('data-style', 'background-color').appendTo(div);

		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVENT(EVT_CHANGE, EVT_INPUT), '.field input, .field select', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onChange(e);

			e.preventDefault();
			e.stopPropagation();
		});
		$(instance._parentEl).on(EVT_MOUSECLICK, '.field button#ia-document-bgimage-select', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onBackgroundImageBrowser(e);

			e.preventDefault();
			e.stopPropagation();
		});

		$(instance._parentEl).on(EVT_MOUSECLICK, '.field button#ia-document-bgimage-clear', function (e) {
			if (G_PROPERTY_LOCK) return;

			instance._onBackgroundImageClear(e);

			e.preventDefault();
			e.stopPropagation();
		});

		$(document).on(EVT_DOCUMENT_UPDATE, function (e) {
			instance._reset();
		});
		instance._reset();
	};

	inews.property.document.Document.destroy = function () {
		var instance = inews.property.document.Document.instance;

		if (!instance) return;

		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVENT(EVT_CHANGE, EVT_INPUT), '.field input, .field select');
		$(instance._parentEl).off(EVT_MOUSECLICK, '.field button#ia-document-bgimage-select');
		$(instance._parentEl).off(EVT_MOUSECLICK, '.field button#ia-document-bgimage-clear');

		$(document).on(EVT_DOCUMENT_UPDATE);

		$(instance._parentEl).empty();
	};

	inews.property.document.Document.prototype._onResize = function (e) {
		$(this).find('input#ia-document-name').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('input#ia-document-editor-status').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('input#ia-document-ratio').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('input#ia-document-bgimage').width($(this).width() - 148 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('input#ia-document-bgimage-size').width($(this).width() - 116 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('input#ia-document-bgcolor').width($(this).width() - 72 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('select#ia-document-bgimage-repeat').width($(this).width() - 70 - G_PROPERTY_SCROLLBAR_SIZE);
		$(this).find('select#ia-document-bgimage-attach').width($(this).width() - 70 - G_PROPERTY_SCROLLBAR_SIZE);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.document.Document.prototype._onChange = function (e) {
		var style = $(e.target).attr('data-style');
		this._sync();
	};

	inews.property.document.Document.prototype._onBackgroundImageBrowser = function (e) {
		var self = this;
		var dlg = new inews.dialog.FileBrowserDlg({
			id: 'ia-document-bgimage-browser',
			path: FILE_PATH_IMAGE,
			extension: 'png;jpg',
			docid: G_EDITOR_INFO['id'],
			previewImage: true
		});
		$(dlg._el).one(EVT_BUTTONCLICK, function (e, action) {
			var file;

			if (action != BTN_SELECT) return;
			file = dlg.getData();
			$('.editor-area').IEditor('css', 'background-image', file);
			self._reset();
		});
	};

	inews.property.document.Document.prototype._onBackgroundImageClear = function (e) {
		$('.editor-area').IEditor('css', 'background-image', '');
		this._reset();
	};

	inews.property.document.Document.prototype._reset = function () {
		if (G_EDITOR_INFO['mode'] == DOCUMENT_EDITMODE_NONE || $('.editor-area .editor').length < 1) {
			$('input#ia-document-name').val('');
			$('input#ia-document-editor-status').val(MESSAGE['DOCUMENT_MODE_NONE']);
			$('input#ia-document-ratio').val('');
			$('input#ia-document-bgimage').val('');
			$('input#ia-document-bgimage-size').val('');
			$('select#ia-document-bgimage-size-unit').val('%');
			$('input#ia-document-bgcolor').val('');
			$('select#ia-document-bgimage-repeat').val('');
			$('select#ia-document-bgimage-attach').val('');

			$(this._parentEl).find('.field button').attr('disabled', true);
		} else {
			var css = $('.editor-area').IEditor('css');

			if (G_EDITOR_INFO['mode'] == DOCUMENT_EDITMODE_NEW) {
				$('input#ia-document-editor-status').val(MESSAGE['DOCUMENT_MODE_NEW']);
			} else {
				$('input#ia-document-editor-status').val(MESSAGE['DOCUMENT_MODE_EDIT']);
			}
			$('input#ia-document-name').val(G_EDITOR_INFO['title']);
			$('input#ia-document-ratio').val(G_EDITOR_INFO['ratio']);
			$('input#ia-document-bgimage').val(css['background-image'][0]);
			$('input#ia-document-bgimage-size').val(css['background-size'][0]);
			$('select#ia-document-bgimage-size-unit').val(css['background-size'][1]);
			$('input#ia-document-bgcolor').val(css['background-color'][0]);
			$('select#ia-document-bgimage-repeat').val(css['background-repeat'][0]);
			$('select#ia-document-bgimage-attach').val(css['background-attachment'][0]);

			$(this._parentEl).find('.field button').removeAttr('disabled');
		}
	};

	inews.property.document.Document.prototype._sync = function () {
		if ($('.editor-area .editor').length < 1) return;

		$('.editor-area').IEditor('css', 'background-image', $('input#ia-document-bgimage').val());
		$('.editor-area').IEditor('css', 'background-size', $('input#ia-document-bgimage-size').val(), $('select#ia-document-bgimage-size-unit').val());
		$('.editor-area').IEditor('css', 'background-color', $('input#ia-document-bgcolor').val());
		$('.editor-area').IEditor('css', 'background-repeat', $('select#ia-document-bgimage-repeat').val());
		$('.editor-area').IEditor('css', 'background-attachment', $('select#ia-document-bgimage-attach').val());
	};

	G_PROPERTY_LIST.push({
		id: 'ia-document',
		name: 'Document',
		'class': inews.property.document.Document,
		icon: 'images/property/document/icon.png'
	});
}(jQuery));