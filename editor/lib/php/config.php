<?php
define('EDITOR_HOME', dirname(realpath(__FILE__)).'/../..');
define('EDITOR_DATA', EDITOR_HOME.'/data');
define('EDITOR_PUBLISH_COMMON', EDITOR_HOME.'/lib/publish');
define('EDITOR_TEMP', EDITOR_HOME.'/temp');

define('EDITOR_PUBLISH', EDITOR_HOME.'/publish');
define('EDITOR_PREVIEW', EDITOR_HOME.'/preview');

define('EDITOR_DB', EDITOR_HOME.'/db');

define('USER_DATA_AUTODEL', '0');
define('USER_QUOTA', '10485760');

session_start();
?>