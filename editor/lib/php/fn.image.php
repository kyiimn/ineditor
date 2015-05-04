<?php
function imageRegUploadedFiles($recvData) {
	global $ERROR, $RESPONSE;

	$list = $recvData['list'];
	$listCnt = (is_array($list)) ? count($list) : 0;

	$imageDir = pathGetImageDir($recvData['docid']);
	if (!$imageDir) {
		$ERROR = 'IMAG0001';
		return false;
	}
	$RESPONSE['list'] = array();
	
	$errFlg = false;
	$uploadedFiles = array();

	for ($i = 0; $i < $listCnt; $i++) {
		$tmpDir = uploadGetTempDir($list[$i]['uploaddate']);
		if (!$tmpDir) {
			$ERROR = 'IMAG0002';
			$errFlg = true;
			break;
		}
		$tmpPath = sprintf('%s/%s', $tmpDir, $list[$i]['name']);
		$imagePath = sprintf('%s/%s', $imageDir, $list[$i]['name']);

		$tmpSize = filesize($tmpPath);
		if (!checkQuotaAddData($tmpSize)) {
			$ERROR = 'IMAG0004';
			return;
		}			
		if (!rename($tmpPath, $imagePath)) {
			$ERROR = 'IMAG0003';
			$errFlg = true;
			break;
		}
		$size = getimagesize($imagePath);
		$uploadedFiles[] = $imagePath;

		$RESPONSE['list'][] = array(
			'width' => $size[0],
			'height' => $size[1],
			'name' => $list[$i]['name']
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