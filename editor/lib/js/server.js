var G_SERVER_SESSION;
var G_SERVER_USERID;

function serverInit() {
	waitbarShow();
	$.ajax({
		async: false,
		data: { fn: 'get_session' },
		type: 'GET',
		url: 'app/session.php',
		success: function (response) {
			waitbarHide();
			if (!response.success) {
				alert(MESSAGEERR[response.msg]);
			} else {
				G_SERVER_SESSION = response.data['session'];
				G_SERVER_USERID = response.data['userid'];
			}
		},
		error: function (data, status, err) {
			waitbarHide();
			alert(MESSAGEERR['SERV0001']);
		}
	});
}

function serverGetTmpid() {
	var tmpid = false;

	waitbarShow();
	$.ajax({
		async: false,
		data: { fn: 'get_tmpid' },
		type: 'GET',
		url: 'app/session.php',
		success: function (response) {
			waitbarHide();
			if (!response.success) {
				alert(MESSAGEERR[response.msg]);
			} else {
				tmpid = response.data['tmpid'];
			}
		},
		error: function (data, status, err) {
			waitbarHide();
			alert(MESSAGEERR['SERV0001']);
		}
	});
	return tmpid;
}