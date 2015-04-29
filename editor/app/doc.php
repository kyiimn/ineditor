<?php
include_once ('../lib/php/config.php');
include_once ('../lib/php/fn.login.php');
include_once ('../lib/php/fn.doc.php');
include_once ('../lib/php/fn.doc.publish.php');
include_once ('../lib/php/fn.path.php');
include_once ('../lib/php/fn.misc.php');
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
		docLoadList($RECVDATA);
		response();
		break;
	case 'load':
		docLoad($RECVDATA);
		response();
		break;
	case 'save':
		docSave($RECVDATA);
		response();
		break;
	case 'publish':
		docPublish($RECVDATA);
		response();
		break;
	case 'preview':
		docPreview($RECVDATA);
		response();
		break;
	case 'delete':
		docDelete($RECVDATA);
		response();
		break;
	default:
		$ERROR = 'REQU0002';
		response();
		break;
}
?>