function docInit() {
	docEditorInfoApply();
}

function docEditorInfoApply() {
	switch (G_EDITOR_INFO['mode']) {
		case DOCUMENT_EDITMODE_NEW:
			$('header .doc-mode').html(MESSAGE['DOCUMENT_MODE_NEW']);
			break;
		case DOCUMENT_EDITMODE_EDIT:
			$('header .doc-mode').html(MESSAGE['DOCUMENT_MODE_EDIT']);
			break;
		case DOCUMENT_EDITMODE_NONE:
		default:
			$('header .doc-mode').html(MESSAGE['DOCUMENT_MODE_NONE']);
			break;
	}
	$('header .doc-info').html(G_EDITOR_INFO['title']);
}

function docNew() {
	var _openDialog = function () {
		var dlg = new inews.dialog.NewDocumentDlg('new-doc-dlg');
		$(dlg.getEl()).one(EVT_BUTTONCLICK, function (e, action) {
			if (action == BTN_OK) {
				var data = dlg.getData();
				var tmpid;

				tmpid = serverGetTmpid();
				if (tmpid == false) {
					alert(MESSAGE['FAIL_TO_GENERATE_TMPID']);
					return false;
				}
				editorOpen({
					id: tmpid,
					title: data.title,
					orientation: data.orientation,
					mode: DOCUMENT_EDITMODE_NEW,
					ratio: data.ratio
				});
				controlStyleResetAnimationName();
				$(document).trigger(EVT_DOCUMENT_UPDATE);
			}
		});
	}

	if ($('.editor-area *').length > 0) {
		if ($('.editor-area').IEditor('getModified')) {
			confirmBox(MESSAGE['EDITOR_HAS_UNSAVED_DATA'], MESSAGE['SAVE'], true, function (e, action) {
				switch (action) {
					case BTN_SAVE:
						docSave();
						$(document).one(EVT_DOCUMENT_SAVED, function (e, result) {
							if (result) _openDialog();
						});
						break;

					case BTN_DONOTSAVE:
						_openDialog();
						break;

					default: break;
				}
			}, {
				buttons: [
					{ action: BTN_SAVE,			name: MESSAGE['SAVE'] },
					{ action: BTN_DONOTSAVE,	name: MESSAGE['DO_NOT_SAVE'] },
					{ action: BTN_CANCEL,		name: MESSAGE['CANCEL'] }
				]
			});
		} else {
			_openDialog();
		}
	} else {
		_openDialog();
	}
}

function docSetUploadedBackgroundFile(options) {
	var obj = GET_OBJ(G_UPLOAD_OBJID);

	if (options.list.length > 0) {
		waitbarShow();
		$.ajax({
			data: {
				fn: 'reg_uploaded_files',
				session: G_SERVER_SESSION,
				user: G_SERVER_USERID,
				docid: G_EDITOR_INFO['id'],
				list: options.list
			},
			type: 'POST',
			url: 'app/image.php',
			success: function (response) {
				var name;

				waitbarHide();
				if (!response.success) {
					alert(MESSAGEERR[response.msg]);
					return;
				}
				name = response.data.list[0].name;
				$('.editor-area').IEditor('css', 'background-image', name);
				$(document).trigger(EVT_DOCUMENT_UPDATE);
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGE['SERVER_ERROR']);
			}
		});
	}
	G_UPLOAD_FILE_CNT = 0;
	G_UPLOAD_FILE_MAX = 0;
	G_UPLOAD_OBJID = false;
	G_UPLOAD_SUCCESS_LIST = false;
	G_UPLOAD_TYPE = false;
}

function docOpen() {
	var dlg;

	dlg = new inews.dialog.OpenDocumentDlg('open-doc-dlg');
	$(dlg.getEl()).one(EVT_BUTTONCLICK, function (e, action) {
		if (action == BTN_SELECT) {
			var id = dlg.getData();
			if ($('.editor-area *').length > 0) {
				if ($('.editor-area').IEditor('getModified')) {
					confirmBox(MESSAGE['EDITOR_HAS_UNSAVED_DATA'], MESSAGE['SAVE'], true, function (e, action) {
						switch (action) {
							case BTN_SAVE:
								docSave();
								$(document).one(EVT_DOCUMENT_SAVED, function (e, result) {
									if (result) _docOpenProc();
								});
								break;

							case BTN_DONOTSAVE:
								_docOpenProc(id);
								break;

							default: break;
						}
					}, {
						buttons: [
							{ action: BTN_SAVE,			name: MESSAGE['SAVE'] },
							{ action: BTN_DONOTSAVE,	name: MESSAGE['DO_NOT_SAVE'] },
							{ action: BTN_CANCEL,		name: MESSAGE['CANCEL'] }
						]
					});
				} else {
					_docOpenProc(id);
				}
			} else {
				_docOpenProc(id);
			}
		}
	});
}

function _docOpenProc(id) {
	waitbarShow();
	$.ajax({
		data: {
			fn: 'load',
			session: G_SERVER_SESSION,
			user: G_SERVER_USERID,
			id: id
		},
		type: 'POST',
		url: 'app/doc.php',
		success: function (response) {
			var name;

			waitbarHide();
			if (!response.success) {
				alert(MESSAGEERR[response.msg]);
				return;
			}
			editorOpen({
				id: response.data.docData.id,
				title: response.data.docData.title,
				orientation: response.data.docData.orientation,
				mode: DOCUMENT_EDITMODE_EDIT,
				ratio: response.data.docData.ratio,
				css: response.data.docData.css,
				data: response.data.docData.data
			});
			editorSetData($('.editor-area .editor'), response.data.docData.objects);
			controlStyleResetAnimationName();

			$(document).trigger(EVT_DOCUMENT_UPDATE);

			$('.editor-area').IEditor('setModified', false);
		},
		error: function (data, status, err) {
			waitbarHide();
			alert(MESSAGEERR['SERV0001']);
		}
	});
}

function docSave(isSaveAs) {
	var data = {};
	var self;

	var _saveProc = function (docid, docTitle, editMode, docOrientation, ratio, oldid) {
		var jsonData;

		data.oldid = (oldid == undefined) ? '' : oldid;
		data.id = docid;
		data.title = docTitle;
		data.editMode = editMode;
		data.orientation = docOrientation;
		data.ratio = ratio;

		jsonData = $.JSON.encode(data);

		waitbarShow();
		$.ajax({
			data: {
				fn: 'save',
				session: G_SERVER_SESSION,
				user: G_SERVER_USERID,
				jsonData: jsonData
			},
			type: 'POST',
			url: 'app/doc.php',
			success: function (response) {
				var name;

				waitbarHide();
				if (!response.success) {
					alert(MESSAGEERR[response.msg]);
					$(document).trigger(EVT_DOCUMENT_SAVED, [false]);
					return;
				}
				editorUpdate({
					id: response.data.id,
					title: response.data.title,
					orientation: response.data.orientation,
					mode: DOCUMENT_EDITMODE_EDIT,
					ratio: response.data.ratio
				});
				$('.editor-area').IEditor('setModified', false);

				controlStyleResetAnimationName();
				$(document).trigger(EVT_DOCUMENT_UPDATE);

				alert(MESSAGE['SAVE_SUCCESS']);

				$(document).trigger(EVT_DOCUMENT_SAVED, [true]);
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGEERR['SERV0001']);
				$(document).trigger(EVT_DOCUMENT_SAVED, [false]);
			}
		});
	};

	var _dlgProc = function (preview, isSaveAs) {
		if (isSaveAs || G_EDITOR_INFO['mode'] == DOCUMENT_EDITMODE_NEW) {
			var dlg = new inews.dialog.SaveDocumentDlg({
				id: 'open-doc-dlg',
				name: G_EDITOR_INFO['title'],
				orientation: G_EDITOR_INFO['orientation'],
				preview: preview
			});
			$(dlg.getEl()).one(EVT_BUTTONCLICK, function (e, action) {
				var retData = dlg.getData();
				if (action == BTN_SAVE) {
					_saveProc('', retData.name, G_EDITOR_INFO['mode'], G_EDITOR_INFO['orientation'], G_EDITOR_INFO['ratio'], G_EDITOR_INFO['id']);
				}
			});
		} else {
			_saveProc(G_EDITOR_INFO['id'], G_EDITOR_INFO['title'], G_EDITOR_INFO['mode'], G_EDITOR_INFO['orientation'], G_EDITOR_INFO['ratio']);
		}
	};

	if ($('.editor-area .editor').length < 1) {
		alert(MESSAGE['EDITDATA_IS_NOT_FOUND']);
		return;
	}
	data.editor = G_EDITOR_NAME;
	data.version = G_EDITOR_VERSION;

	data.css = $('.editor-area').IEditor('css');
	data.data = $('.editor-area').IEditor('getData');
	data.objects = editorGetData($('.editor-area .editor'));

	html2canvas($('.editor')[0], {
		onrendered: function(canvas) {
			var width = parseInt(canvas.width);
			var height = parseInt(canvas.height);
			var ratio = height / width;

			var preview, context, nwidth, nheight;
			var previewWidth = 500;

			nwidth = previewWidth;
			nheight = Math.round(previewWidth * ratio);

			preview = document.createElement("canvas");
			preview.width = nwidth;
			preview.height = nheight;

			context = preview.getContext('2d');
			context.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, nwidth, nheight);

			data.preview = preview.toDataURL('image/jpeg', 0.5);

			_dlgProc(data.preview, isSaveAs);
		}
	});
}

function docSaveAs() {
	docSave(true);
}

function docClose() {
	if ($('.editor-area *').length < 1) return;

	if ($('.editor-area').IEditor('getModified')) {
		confirmBox(MESSAGE['EDITOR_HAS_UNSAVED_DATA'], MESSAGE['SAVE'], true, function (e, action) {
			switch (action) {
				case BTN_SAVE:
					docSave();
					$(document).one(EVT_DOCUMENT_SAVED, function (e, result) {
						if (result) {
							editorClose();
							controlStyleResetAnimationName();
							$(document).trigger(EVT_DOCUMENT_UPDATE);
						}
					});
					break;

				case BTN_DONOTSAVE:
					editorClose();
					controlStyleResetAnimationName();
					$(document).trigger(EVT_DOCUMENT_UPDATE);
					break;

				default: break;
			}
		}, {
			buttons: [
				{ action: BTN_SAVE,			name: MESSAGE['SAVE'] },
				{ action: BTN_DONOTSAVE,	name: MESSAGE['DO_NOT_SAVE'] },
				{ action: BTN_CANCEL,		name: MESSAGE['CANCEL'] }
			]
		});
	} else {
		editorClose();
		$(document).trigger(EVT_DOCUMENT_UPDATE);
	}
}

function docPublish() {
	var _publish = function () {
		waitbarShow();
		$.ajax({
			data: {
				fn: 'publish',
				session: G_SERVER_SESSION,
				user: G_SERVER_USERID,
				id: G_EDITOR_INFO['id']
			},
			type: 'POST',
			url: 'app/doc.php',
			success: function (response) {
				waitbarHide();
				if (!response.success) {
					alert(MESSAGEERR[response.msg]);
					return;
				}
				window.open(response.data.zipUrl);
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGEERR['SERV0001']);
			}
		});
	};
	if ($('.editor-area .editor').length < 1) {
		alert(MESSAGE['EDITDATA_IS_NOT_FOUND']);
		return;
	}
	if ($('.editor-area').IEditor('getModified')) {
		confirmBox(MESSAGE['EDITOR_HAS_UNSAVED_DATA'], MESSAGE['PUBLISH'], true, function (e, action) {
			switch (action) {
				case BTN_SAVE:
					docSave();
					$(document).one(EVT_DOCUMENT_SAVED, function (e, result) {
						if (result) _publish();
					});
					break;

				default: break;
			}
		}, {
			buttons: [
				{ action: BTN_SAVE,			name: MESSAGE['SAVE'] },
				{ action: BTN_CANCEL,		name: MESSAGE['CANCEL'] }
			]
		});
	} else {
		_publish();
	}
}

function docPreview() {
	var data = {};

	if ($('.editor-area .editor').length < 1) {
		alert(MESSAGE['EDITDATA_IS_NOT_FOUND']);
		return;
	}
	data.id = G_EDITOR_INFO['id'];
	data.title = G_EDITOR_INFO['title'];
	data.orientation = G_EDITOR_INFO['orientation'];

	data.css = $('.editor-area').IEditor('css');
	data.data = $('.editor-area').IEditor('getData');
	data.objects = editorGetData($('.editor-area .editor'));

	waitbarShow();
	$.ajax({
		data: {
			fn: 'preview',
			session: G_SERVER_SESSION,
			user: G_SERVER_USERID,
			id: G_EDITOR_INFO['id'],
			data: $.JSON.encode(data)
		},
		type: 'POST',
		url: 'app/doc.php',
		success: function (response) {
			waitbarHide();
			if (!response.success) {
				alert(MESSAGEERR[response.msg]);
				return;
			}
			window.open(response.data.previewUrl);
		},
		error: function (data, status, err) {
			waitbarHide();
			alert(MESSAGEERR['SERV0001']);
		}
	});
}