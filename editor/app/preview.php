<?php
include_once ('../lib/php/config.php');
include_once ('../lib/php/fn.login.php');
include_once ('../lib/php/fn.doc.php');
include_once ('../lib/php/fn.doc.publish.php');
include_once ('../lib/php/fn.doc.preview.php');
include_once ('../lib/php/fn.path.php');
include_once ('../lib/php/fn.misc.php');
include_once ('request.php');

$userInfo = loginGetInfo();
if (!$userInfo) {
	$ERROR = 'LOGI0001';
	response();
}

$PREVIEW = true;

switch ($FN) {
	case 'html':
		docPreviewHTML();
		break;
	case 'js':
		docPreviewJS();
		break;
	case 'css':
		docPreviewCSS();
		break;
	default:
		$ERROR = 'REQU0002';
		response();
		break;
}
?>