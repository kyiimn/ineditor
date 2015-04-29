<?php
include_once ('../lib/php/config.php');
include_once ('../lib/php/fn.login.php');
include_once ('../lib/php/fn.file.php');
include_once ('../lib/php/fn.path.php');
include_once ('request.php');

$userInfo = loginGetInfo();
if (!$userInfo) {
	$ERROR = 'LOGI0001';
	response();
}

if ($userInfo['id'] !== $RECVDATA['user']) {
	$ERROR = 'LOGI0002';
	response();
}

if ($RECVDATA['session'] != session_id()) {
	$ERROR = 'REQU0001';
	response();
}

switch ($FN) {
	case 'load_list':
		fileLoadList($RECVDATA);
		response();
		break;
	default:
		$ERROR = 'REQU0002';
		response();
		break;
}
?>