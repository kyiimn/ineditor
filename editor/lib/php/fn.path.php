<?php
function pathGetDataDir() {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;

	return sprintf('%s/%s', EDITOR_DATA, $userInfo['id']);
}

function pathGetDocDir($docid) {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;
	if (!$docid) return false;

	return sprintf('%s/%s/%s', EDITOR_DATA, $userInfo['id'], $docid);
}

function pathGetInDocPath($docid) {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;
	if (!$docid) return false;

	return sprintf('%s/%s/%s/%s.indoc', EDITOR_DATA, $userInfo['id'], $docid, $docid);
}

function pathGetFileDir($docid, $type, $fullpath = true) {
	if (!$docid) return false;
	if (!$type) return false;

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

	if ($fullpath) {
		$userInfo = loginGetInfo();
		if (!$userInfo) return false;

		$path = sprintf('%s/%s/%s', EDITOR_DATA, $userInfo['id'], $path);
		if (!file_exists($path)) {
			if (!mkdir($path, 0775, true)) return false;
		}
	}
	return $path;
}

function pathGetImageDir($docid) {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;
	if (!$docid) return false;

	$path = sprintf('%s/%s/%s/images', EDITOR_DATA, $userInfo['id'], $docid);
	if (!file_exists($path)) {
		if (!mkdir($path, 0775, true)) return false;
	}
	return $path;
}

function pathGetMediaDir($docid, $type) {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;
	if (!$docid) return false;
	if (!$type) return false;

	$path = sprintf('%s/%s/%s/media/%s', EDITOR_DATA, $userInfo['id'], $docid, $type);
	if (!file_exists($path)) {
		if (!mkdir($path, 0775, true)) return false;
	}
	return $path;
}

function pathGetPublishDir($docid) {
	if (!$docid) return false;
	return sprintf('%s/%s', EDITOR_PUBLISH, $docid);
}

function pathGetPublishZipPath($zipName) {
	if (!$zipName) return false;
	return sprintf('%s/%s', EDITOR_PUBLISH, $zipName);
}

function pathGetPreviewDir($docid, $type) {
	$userInfo = loginGetInfo();
	if (!$userInfo) return false;
	if (!$docid) return false;
	if (!$type) return false;

	switch ($type) {
		case 'data':
			$path = sprintf('../data/%s/%s/', $userInfo['id'], $docid);
			break;
		case 'image':
			$path = sprintf('../data/%s/%s/images/', $userInfo['id'], $docid);
			break;
		case 'audio':
			$path = sprintf('../data/%s/%s/media/audio/', $userInfo['id'], $docid);
			break;
		case 'video':
			$path = sprintf('../data/%s/%s/media/video/', $userInfo['id'], $docid);
			break;
		default:
			$path = false;
			break;
	}
	return $path;
}
?>