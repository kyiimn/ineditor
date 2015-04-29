<?php
header('Content-type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$RECVDATA = $_POST;
} else {
	$RECVDATA = $_GET;
}
$FN = strtolower($RECVDATA['fn']);

$RESPONSE = array();
$ERROR = false;

function response() {
	global $RESPONSE, $ERROR;

	$result = array();
	$result['data'] = $RESPONSE;
	if ($ERROR) {
		$result['msg'] = $ERROR;
		$result['success'] = false;
	} else {
		$result['success'] = true;
	}
	echo json_encode($result);

	exit();
}
?>