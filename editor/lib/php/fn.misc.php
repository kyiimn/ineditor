<?php
function copyAll($src, $dst) {
	$dir = opendir($src);

	if (!file_exists($dst)) {
		if (!mkdir($dst, 0775, true)) return false;
	}
	while (false !== ($file = readdir($dir))) {
		if (($file != '.') && ($file != '..')) {
			if (is_dir($src.'/'.$file)) {
				if (!copyAll($src.'/'.$file, $dst.'/'.$file)) return false;
			}
			else {
				if (!copy($src.'/'.$file, $dst.'/'.$file)) return false;
			}
		}
	}
	closedir($dir);

	return true;
}

function unlinkAll($dir) {
	foreach (glob($dir.'/*') as $file) {
		if (is_dir($file)) {
			if (!unlinkAll($file)) return false;
		} else {
			if (!unlink($file)) return false;
		}
	}
	if (!rmdir($dir)) return false;

	return true;
}

function getimagesizeEx($loc) {
	if (substr($loc, 0, 4) == 'http') {
		$remote = true;
		$imagePath = tmpfile().basename($loc);
		if (!file_put_contents($imagePath, file_get_contents($loc))) return false;
	} else {
		$remote = false;
		$imagePath = $loc;
	}
	if (!file_exists($imagePath)) return false;
	$size = getimagesize($imagePath);

	if ($remote) unlink($imagePath);

	return $size;
}

function getFileList($root, $path = '') {
	$list = array();

	$dir = opendir($root.'/'.$path);
	while (false !== ($file = readdir($dir))) {
		if (($file != '.') && ($file != '..')) {
			if (is_dir($root.'/'.$path.$file)) {
				$subList = getFileList($root, $path.$file.'/');
				$list = array_merge($list, $subList);
			} else {
				$list[] = $path.$file;
			}
		}
	}
	closedir($dir);

	return $list;
}

function generateGuid() {
	static $guid = '';

	$uid = uniqid("", true);

	$data  = $_SERVER['REQUEST_TIME'];
	$data .= $_SERVER['HTTP_USER_AGENT'];
	$data .= $_SERVER['LOCAL_ADDR'];
	$data .= $_SERVER['LOCAL_PORT'];
	$data .= $_SERVER['REMOTE_ADDR'];
	$data .= $_SERVER['REMOTE_PORT'];

	$hash = strtoupper(hash('ripemd128', $uid.$guid.md5($data)));

	$guid  = substr($hash, 0, 8);
	$guid .= '-';
	$guid .= substr($hash, 8, 4);
	$guid .= '-';
	$guid .= substr($hash, 12, 4);
	$guid .= '-';
	$guid .= substr($hash, 16, 4);
	$guid .= '-';
	$guid .= substr($hash, 20, 12);

	return strtoupper($guid);
}

function unlinkIndoc($dir) {
	foreach (glob($dir.'/*') as $file) {
		if (is_dir($file)) continue;

		$ext = strtolower(substr($file, strrpos($file, '.') + 1));
		if ($ext === 'indoc' || $ext === 'info') {
			if (!unlink($file)) return false;
		}
	}
	return true;
}

function getDirSize($path) {
    $total = 0;
    $files = scandir($path);
    $fullPath = rtrim($path, '/'). '/';

    foreach($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $curFile = $fullPath . $file;
            if (is_dir($curFile)) {
                $size = getDirSize($curFile);
                $total += $size;
            }
            else {
                $size = filesize($curFile);
                $total += $size;
            }
        }   
    }
    return $total;
}

function getUserDataSize() {
	$path = pathGetDataDir();
	if (!$path) return false;
	return getDirSize($path);
}

function checkQuotaAddData($addSize = 0) {
	if (USER_QUOTA == 0) return true;
	
	$userSize = getUserDataSize();
	if (($userSize + $addSize) > USER_QUOTA) return false;
	
	return true;
}
?>