<?php
function mediaRegUploadedFiles($recvData) {
	global $ERROR, $ERRORDATA, $RESPONSE;

	$list = $recvData['list'];
	$listCnt = (is_array($list)) ? count($list) : 0;

	$mediaDir = pathGetMediaDir($recvData['docid'], $recvData['type']);
	if (!$mediaDir) {
		$ERROR = 'MEDI0001';
		return false;
	}
	$RESPONSE['list'] = array();

	$errFlg = false;
	$uploadedFiles = array();

	for ($i = 0; $i < $listCnt; $i++) {
		$tmpDir = uploadGetTempDir($list[$i]['uploaddate']);
		if (!$tmpDir) {
			$ERROR = 'MEDI0002';
			$errFlg = true;
			break;
		}
		$tmpPath = sprintf('%s/%s', $tmpDir, $list[$i]['name']);
		$mediaPath = sprintf('%s/%s', $mediaDir, $list[$i]['name']);

		$tmpSize = filesize($tmpPath);
		if (!checkQuotaAddData($tmpSize)) {
			$ERROR = 'MEDI0004';
			return;
		}
		if (file_exists($mediaPath)) {
			$ERROR = 'MEDI0005';
			$ERRORDATA = $list[$i]['name'];
			return;
		}
		if (!rename($tmpPath, $mediaPath)) {
			$ERROR = 'MEDI0003';
			$errFlg = true;
			break;
		}
		$uploadedFiles[] = $mediaPath;

		$RESPONSE['list'][] = array(
			'name' => $list[$i]['name'],
			'type' => $list[$i]['type']
		);
	}
	if ($errFlg) {
		for (; $i < $listCnt; $i++) {
			$tmpPath = sprintf('%s/%s', $tmpDir, $list[$i]['name']);
			unlink($tmpPath);
		}
		$uploadedFileCnt = (is_array($uploadedFiles) ? count($uploadedFiles) : 0);
		for ($i = 0; $i < $uploadedFileCnt; $i++) {
			unlink($uploadedFiles[$i]);
		}
		return false;
	}
	$RESPONSE['docid'] = $recvData['docid'];

	return true;
}
?>