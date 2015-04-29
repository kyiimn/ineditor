<?php
function imageGetImageDir($docid) {
	$path = pathGetImageDir($docid);
	if (!file_exists($path)) {
		if (!mkdir($path, 0777, true)) return false;
	}
	return $path;
}

function imageRegUploadedFiles($recvData) {
	global $ERROR, $RESPONSE;

	$list = $recvData['list'];
	$listCnt = (is_array($list)) ? count($list) : 0;

	$imageDir = imageGetImageDir($recvData['docid']);
	if (!$imageDir) {
		$ERROR = 'IMAG0001';
		return false;
	}
	$RESPONSE['list'] = array();

	for ($i = 0; $i < $listCnt; $i++) {
		$tmpDir = uploadGetTempDir($list[$i]['uploaddate']);
		if (!$tmpDir) {
			$ERROR = 'IMAG0002';
			return false;
		}
		$tmpPath = sprintf('%s/%s', $tmpDir, $list[$i]['name']);
		$imagePath = sprintf('%s/%s', $imageDir, $list[$i]['name']);

		if (!rename($tmpPath, $imagePath)) {
			$ERROR = 'IMAG0003';
			return false;
		}
		$size = getimagesize($imagePath);

		$RESPONSE['list'][] = array(
			'width' => $size[0],
			'height' => $size[1],
			'name' => $list[$i]['name']
		);
	}
	$RESPONSE['docid'] = $recvData['docid'];

	return true;
}
?>