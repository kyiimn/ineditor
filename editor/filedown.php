<?php
$fn = $_GET['fn'];

if (!file_exists($fn)) {
	echo 'File is not found';
	exit();
}
$size = filesize($fn);

header('Content-Description: File Transfer');
header('Content-Type: image/png');
header('Content-Disposition: attachment; filename="'.basename($fn).'"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: '.$size);

readfile($fn);

unlink($fn);
?>