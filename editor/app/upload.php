<?php
include_once ('../lib/php/config.php');
include_once ('../lib/php/fn.login.php');
include_once ('../lib/php/fn.upload.php');
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

if ($FN != 'upload') {
	$ERROR = 'REQU0002';
	response();
}

$rawData = $RECVDATA['rawdata'];
if (!$rawData) {
	$ERROR = 'UPLO0001';
	response();
}
$data = file_get_contents($rawData);

$filename = urlencode(str_replace(' ', '', $RECVDATA['name']));

$uploaddate = date('Ymd');
$tmpDir = uploadGetTempDir($uploaddate);
if (!$tmpDir) {
	$ERROR = 'UPLO0002';
	response();
}
$tmpPath = sprintf('%s/%s', $tmpDir, $filename);
if (!file_put_contents($tmpPath, $data)) {
	$ERROR = 'UPLO0003';
	return false;
}
$RESPONSE['name'] = $filename;
$RESPONSE['size'] = $RECVDATA['size'];
$RESPONSE['type'] = $RECVDATA['type'];
$RESPONSE['uploaddate'] = $uploaddate;

response();
?>