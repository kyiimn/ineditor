function boxSetUploadedBackgroundFile(options) {
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
				$(obj).IObject('css', 'background-image', name);
				$(obj).trigger(EVT_STYLECHANGE);
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
