<?php
function fileGetPath($type, $docid) {
	switch ($type) {
		case 'data':
			$path = sprintf('%s', $docid);
			break;
		case 'image':
			$path = sprintf('%s/images', $docid);
			break;
		case 'audio':
			$path = sprintf('%s/media/audio', $docid);
			break;
		case 'video':
			$path = sprintf('%s/media/video', $docid);
			break;
		default:
			$path = false;
			break;
	}
	return $path;
}

function fileCompExt($exts, $target) {
	$extCnt = (is_array($exts)) ? count($exts) : 0;
	if ($extCnt == 0) return true;

	for ($i = 0; $i < $extCnt; $i++) {
		if (strtolower($exts[$i]) == strtolower($target)) return true;
	}
	return false;
}

function fileLoadList($data) {
	global $ERROR, $RESPONSE;

	$path = pathGetFileDir($data['docid'], $data['path'], false);
	if (!$path) {
		$ERROR = 'FILE0001';
		return;
	}
	$rPath = pathGetFileDir($data['docid'], $data['path']);
	$exts = explode(';', $data['extension']);

	$list = array();
	if (file_exists($rPath)) {
		if ($dir = opendir($rPath)) {
			while (($file = readdir($dir)) !== false) {
				$fullPath = sprintf('%s/%s', $rPath, $file);

				if ($file[0] == '.') continue;
				if (!is_file($fullPath)) continue;

				$ext = substr($file, strrpos($file, '.') + 1);
				if (!fileCompExt($exts, $ext)) continue;

				$mdate = filemtime($fullPath);
				if (!$mdate) $mdate = fileatime($fullPath);
				$size = filesize($fullPath);
				$list[] = array(
					'name' => $file,
					'date' => ($mdate) ? date('Y-m-d', $mdate) : '',
					'timestamp' => $mdate,
					'size' => $size,
					'ext' => $ext
				);
			}
			closedir($dir);
		}
	}
	$RESPONSE['list'] = $list;
	$RESPONSE['path'] = $path;
}
?>