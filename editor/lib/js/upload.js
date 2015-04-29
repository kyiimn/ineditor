var G_UPLOAD_FILE_CNT;
var G_UPLOAD_FILE_MAX;
var G_UPLOAD_OBJID;
var G_UPLOAD_SUCCESS_LIST;
var G_UPLOAD_TYPE;

var G_UPLOAD_DEFINE = {
	box: {
		allow: ['image/jpeg', 'image/png'],
		callback: _callbackOnUploadBoxBackgroundComplete,
		mobile: 'image'
	},
	document: {
		allow: ['image/jpeg', 'image/png'],
		callback: _callbackOnUploadDocBackgroundComplete,
		mobile: 'image'
	},
	image: {
		allow: ['image/jpeg', 'image/png'],
		callback: _callbackOnUploadImageComplete,
		mobile: 'image'
	},
/*	video: {
		allow: ['video/mp4'],
		callback: _callbackOnUploadVideoComplete,
		mobile: 'video'
	},*/
	audio: {
		allow: ['audio/mpeg3', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'video/ogg'],
		callback: _callbackOnUploadAudioComplete,
		mobile: 'audio'
	}
};

function _callbackOnUploadBoxBackgroundComplete(options) { boxSetUploadedBackgroundFile(options); }
function _callbackOnUploadDocBackgroundComplete(options) { docSetUploadedBackgroundFile(options); }
function _callbackOnUploadImageComplete(options) { imageAddUploadedFile(options); }
function _callbackOnUploadVideoComplete(options) { videoAddUploadedFile(options); }
function _callbackOnUploadAudioComplete(options) { audioAddUploadedFile(options); }

function uploadUpdateStatus() {
	waitbarSetContent('<br><br><br><br><br><center><b>' + G_UPLOAD_FILE_CNT + ' / ' + G_UPLOAD_FILE_MAX + '</b></center>');
}

function uploadFileTransfer(file, index, data) {
	var data = {
		session: G_SERVER_SESSION,
		user: G_SERVER_USERID,
		fn: 'upload',
		name: file.name,
		size: file.size,
		type: file.type,
		rawdata: data
	};
	waitbarShow();
	uploadUpdateStatus();

	$.ajax({
		data: data,
		type: 'POST',
		url: 'app/upload.php',
		success: function (response) {
			waitbarHide();

			G_UPLOAD_FILE_CNT++;
			uploadUpdateStatus();

			if (!response.success) {
				alert(MESSAGEERR[response.msg]);
			} else {
				G_UPLOAD_SUCCESS_LIST.push({
					name: response.data.name,
					size: response.data.size,
					type: response.data.type,
					uploaddate: response.data.uploaddate
				});
			}
			if (G_UPLOAD_FILE_CNT != G_UPLOAD_FILE_MAX) return;

			G_UPLOAD_DEFINE[G_UPLOAD_TYPE].callback({
				objid: G_UPLOAD_OBJID,
				list: G_UPLOAD_SUCCESS_LIST
			});
		},
		error: function (data, status, err) {
			waitbarHide();
			alert(MESSAGEERR['SERV0001']);
		}
	});
}

function uploadOnDrop(dataTransfer, objid, type) {
	var files = dataTransfer.files;
	var count = files.length;

	G_UPLOAD_FILE_CNT = 0;
	G_UPLOAD_FILE_MAX = count;
	G_UPLOAD_OBJID = objid;
	G_UPLOAD_SUCCESS_LIST = [];
	G_UPLOAD_TYPE = type;

	if (G_UPLOAD_DEFINE[type] == undefined) {
		alert(MESSAGE['OBJECT_IS_NOT_SUPPORTED_UPLOAD']);
		return;
	}

	for (var i = 0; i < count; i++) {
		var file = files[i];
		var reader = new FileReader();
		reader.index = i;
		reader.file = file;

		if (G_UPLOAD_DEFINE[type]['allow'].indexOf(file.type) > -1) {
			reader.addEventListener("loadend",
				function (e) {
					uploadFileTransfer(this.file, this.index, e.target.result);
				}, false
			);
			reader.readAsDataURL(file);
		} else {
			alert(MESSAGE['FILETYPE_IS_NOT_SUPPORTED']+file.name);
			G_UPLOAD_FILE_CNT++;
		}
	}
}

function uploadInit() {
	if (typeof FileReader == 'undefined') {
		alert(MESSAGE['FILEREADER_IS_NOT_SUPPORTED']);
		return;
	}
	if (!G_MAIN_TOUCH_ENABLE) {
		$.event.props.push('dataTransfer');

		$(document).on(EVT_UPLOAD_DRAGOVER, '.file-drop-here', function (e) {
			if ($(this).attr('data-type') == undefined) return;

			$(this).addClass('dragover');

			e.stopPropagation();
			e.preventDefault();
		});

		$(document).on(EVT_UPLOAD_DRAGLEAVE, '.file-drop-here', function (e) {
			if ($(this).attr('data-type') == undefined) return;

			$(this).removeClass('dragover');

			e.stopPropagation();
			e.preventDefault();
		});

		$(document).on(EVT_UPLOAD_DROP, '.file-drop-here', function (e) {
			var dataTransfer = e.dataTransfer;
			var type = $(this).attr('data-type');
			var target = $(this).attr('data-target');

			if (type == undefined) return;
			if (target == undefined) return;

			$(this).removeClass('dragover');

			e.stopPropagation();
			e.preventDefault();

			uploadOnDrop(dataTransfer, target, type);
		});
	} else {
		$(document).on(EVT_MOUSEDBLCLICK, '.file-drop-here', function (e) {
			var type = $(this).attr('data-type');
			var target = $(this).attr('data-target');

			new inews.dialog.MobileUploadDlg({
				id: 'mobile-upload',
				target: target,
				type: type
			});
			e.stopPropagation();
			e.preventDefault();
		});
	}
}
