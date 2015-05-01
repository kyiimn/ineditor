<?php
function loginFBGetID($fbid) {
	if (!file_exists(EDITOR_DB)) mkdir(EDITOR_DB, 0775, true);

	$dbconn = new PDO('sqlite:'.EDITOR_DB.'/users.db');
	$dbconn->exec('CREATE TABLE IF NOT EXISTS fb_users (fbid STRING PRIMARY KEY, id STRING)');
	$dbconn->exec('CREATE UNIQUE INDEX IF NOT EXISTS fb_users_idx_fbid ON fb_users(fbid)');
	
	$stmt = $dbconn->prepare('SELECT id FROM fb_users WHERE fbid=:fbid');
	$stmt->bindParam(':fbid', $fbid);

	$result = $stmt->execute();

	$data = $stmt->fetch();

	if (!$data) {
		$id = generateGuid();
		$stmt = $dbconn->prepare('INSERT INTO fb_users (fbid, id) VALUES (:fbid, :id)');
		$stmt->bindParam(':fbid', $fbid);
		$stmt->bindParam(':id', $id);
		if (!$stmt->execute()) $id = false;
	} else {
		$id = $data['id'];
	}
	return $id;
}

function loginFB($fbid, $fbname, $fbemail) {
	$id = loginFBGetID($fbid);
	if (!$id) return false;

	$_SESSION['__LOGIN_ID'] = $id;
	$_SESSION['__LOGIN_NAME'] = $fbname;
	$_SESSION['__LOGIN_EMAIL'] = $fbemail;
	$_SESSION['__LOGIN_TYPE'] = 'facebook';

	return loginGetInfo();
}
?>