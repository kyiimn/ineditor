<?php
function docPreviewHTML() {
	$data = $_SESSION['PREVIEW_DATA'];

	$html = docPublishMakeMainHTML($data, EDITOR_PUBLISH_COMMON);

	header('Content-type: text/html');
	echo $html;
}

function docPreviewCSS() {
	$data = $_SESSION['PREVIEW_DATA'];

	$css = docPublishMakeStyleCSS($data);

	header('Content-type: text/css');
	echo $css;
}

function docPreviewJS() {
	$data = $_SESSION['PREVIEW_DATA'];

	docPublishMakeStyleCSS($data);
	$js = docPublishMakeDataJS($data, $outputPath);

	header('Content-type: text/javascript');
	echo $js;
}
?>
