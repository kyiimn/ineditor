function imageAddUploadedFile(options) {
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
				var imageData = $(obj).IObject('getData', OBJECT_TYPE_IMAGE);

				waitbarHide();
				if (!response.success) {
					var msg = MESSAGEERR[response.msg];
					if (response.errdata) msg += " (" + response.errdata + ')';
					alert(msg);
					return;
				}
				$.each(response.data.list, function (idx, val) {
					imageData.list.push({
						width: parseInt(val['width']),
						height: parseInt(val['height']),
						name: val['name'],
						type: OBJECT_IMAGE_ITEMTYPE_SERVER,
						fill: OBJECT_IMAGE_FILLTYPE_AUTOFIT_INNER
					});
				});
				$(obj).IObject('setData', OBJECT_TYPE_IMAGE, imageData);
				$(obj).trigger(EVT_REDRAW);
				$(obj).trigger(EVT_UPDATE);
			},
			error: function (data, status, err) {
				waitbarHide();
				alert(MESSAGEERR['SERV0001']);
			}
		});
	}
	G_UPLOAD_FILE_CNT = 0;
	G_UPLOAD_FILE_MAX = 0;
	G_UPLOAD_OBJID = false;
	G_UPLOAD_SUCCESS_LIST = false;
	G_UPLOAD_TYPE = false;
}
