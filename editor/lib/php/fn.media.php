<?php
function mediaRegUploadedFiles($recvData) {
	global $ERROR, $RESPONSE;

	$list = $recvData['list'];
	$listCnt = (is_array($list)) ? count($list) : 0;

	$mediaDir = pathGetMediaDir($recvData['docid'], $recvData['type']);
	if (!$mediaDir) {
		$ERROR = 'MEDI0001';
		return false;
	}
	$RESPONSE['list'] = array();

	for ($i = 0; $i < $listCnt; $i++) {
		$tmpDir = uploadGetTempDir($list[$i]['uploaddate']);
		if (!$tmpDir) {
			$ERROR = 'MEDI0002';
			return false;
		}
		$tmpPath = sprintf('%s/%s', $tmpDir, $list[$i]['name']);
		$mediaPath = sprintf('%s/%s', $mediaDir, $list[$i]['name']);

		if (!rename($tmpPath, $mediaPath)) {
			$ERROR = 'MEDI0003';
			return false;
		}
		$RESPONSE['list'][] = array(
			'name' => $list[$i]['name'],
			'type' => $list[$i]['type']
		);
	}
	$RESPONSE['docid'] = $recvData['docid'];

	return true;
}
?>