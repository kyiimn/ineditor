<?php
function logout() {
	unset($_SESSION['__LOGIN_ID']);
	unset($_SESSION['__LOGIN_NAME']);
	unset($_SESSION['__LOGIN_EMAIL']);
	unset($_SESSION['__LOGIN_TYPE']);
}

function loginGetInfo() {
    if (!isset($_SESSION['__LOGIN_ID'])) {
        //return false;
        $_SESSION['__LOGIN_ID'] = 'testuser';
        $_SESSION['__LOGIN_NAME'] = 'Test User';
        $_SESSION['__LOGIN_EMAIL'] = 'test@user.co';
        $_SESSION['__LOGIN_TYPE'] = 'dummyaccount';
    }
    if (empty($_SESSION['__LOGIN_ID'])) return false;

	return array(
		'id' => $_SESSION['__LOGIN_ID'],
		'name' => $_SESSION['__LOGIN_NAME'],
		'email' => $_SESSION['__LOGIN_EMAIL'],
		'type' => $_SESSION['__LOGIN_TYPE']
	);
}
?>
