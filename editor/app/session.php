<?php
include_once ('../lib/php/config.php');
include_once ('../lib/php/fn.login.php');
include_once ('request.php');

$userInfo = loginGetInfo();
if (!$userInfo) {
	$ERROR = 'LOGI0001';
	response();
}

switch ($FN) {
	case 'get_session':
		$RESPONSE['session'] = session_id();
		$RESPONSE['userid'] = $userInfo['id'];
		response();
		break;
	case 'get_tmpid':
		$RESPONSE['tmpid'] = sprintf('.tmp%s_%s%s', date('Ymd'), substr(session_id(), 0, 6), mt_rand(11111111, 99999999));
		response();
		break;
	default:
		$ERROR = 'REQU0002';
		response();
		break;
}
?>