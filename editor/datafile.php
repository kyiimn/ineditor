<?php
include_once ('lib/php/config.php');
include_once ('lib/php/fn.login.php');
include_once ('lib/php/fn.misc.php');

$userInfo = loginGetInfo();
if (!$userInfo) {
	header('HTTP/1.0 403 Forbidden');
	echo 'you are not logined';
	exit();
}

$tmp = explode('/', $_GET['fn']);
if (!is_array($tmp) || count($tmp) < 2) {
	header('HTTP/1.0 404 Not Found');
	echo 'invalid access';
	exit();
}

$userid = $tmp[0];
if ($userid !== $userInfo['id']) {
	header('HTTP/1.0 403 Forbidden');
	echo 'permission denied';
	exit();
}

$fn = realpath(sprintf('data/%s', $_GET['fn']));
$lastmod = gmdate('r', filemtime($fn));
$etag = md5(filemtime($fn).$fn);

if ((isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && $_SERVER['HTTP_IF_MODIFIED_SINCE'] == $lastmod) ||
	(isset($_SERVER['HTTP_IF_NONE_MATCH']) && str_replace('"', '', stripslashes($_SERVER['HTTP_IF_NONE_MATCH'])) == $etag)
) {
	header('HTTP/1.1 304 Not Modified');
	exit();
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimetype = finfo_file($finfo, $fn);
finfo_close($finfo);

header('Cache-Control: must-revalidate');
header('Content-Type: '.$mimetype);
header('Last-Modified: '.$lastmod);
header('Etag: '.$etag);

readfile($fn);
?>