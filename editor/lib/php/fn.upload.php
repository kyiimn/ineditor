<?php
function uploadGetTempDir($uploaddate) {
	$dir = sprintf('%s/%s/%s', EDITOR_TEMP, session_id(), $uploaddate);
	if (!file_exists($dir)) {
		if (!mkdir($dir, 0775, true)) return false;
	}
	return $dir;
}
?>