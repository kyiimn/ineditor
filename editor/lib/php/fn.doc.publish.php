<?php
function docPublishMakeHTML($xmlPath, $outputPath) {
	global $ERROR;

	$data = docLoadXML($xmlPath);

	$id = $data['id'];

	$dataPath = dirname($xmlPath);
	$outputHtml = sprintf('%s/%s.html', $outputPath, $id);

	if (file_exists($outputPath)) {
		if (!unlinkAll($outputPath)) {
			$ERROR = 'DOPU0001';
			return false;
		}
	}

	if (file_exists($dataPath)) {
		if (!copyAll($dataPath, $outputPath)) {
			$ERROR = 'DOPU0002';
			return false;
		}
	} else {
		mkdir($outputPath);
	}

	if (!unlinkIndoc($outputPath)) {
		$ERROR = 'DOPU0013';
		return false;
	}

	if (!copyAll(EDITOR_PUBLISH_COMMON, $outputPath)) {
		$ERROR = 'DOPU0003';
		return false;
	}

	$cssStyle = docPublishMakeStyleCSS($data);
	$cssStylePath = sprintf('%s/css/style.css', $outputPath);
	if (file_put_contents($cssStylePath, $cssStyle) === false) {
		$ERROR = 'DOPU0008';
		return false;
	}

	$jsData = docPublishMakeDataJS($data, $outputPath);
	$jsDataPath = sprintf('%s/js/data.js', $outputPath);
	if (file_put_contents($jsDataPath, $jsData) === false) {
		$ERROR = 'DOPU0004';
		return false;
	}

	$html = docPublishMakeMainHTML($data, $outputPath);
	$htmlPath = sprintf('%s/main.html', $outputPath);
	if (file_put_contents($htmlPath, $html) === false) {
		$ERROR = 'DOPU0010';
		return false;
	}
	return true;
}

function docPublishMakeTransitionCSS($objects) {
	$objectCnt = (is_array($objects)) ? count($objects) : 0;

	$css = "";
	for ($i = 0; $i < $objectCnt; $i++) {
		if (isset($objects[$i]['data']['transition'])) {
			$transition = $objects[$i]['data']['transition'];
			$transitionCnt = (is_array($transition)) ? count($transition) : 0;

			$css .= sprintf("#%s.transition {\n", $objects[$i]['id']);
			$value = '';
			for ($j = 0; $j < $transitionCnt; $j++) {
				if ($j > 0) $value .= ", ";
				$value .= sprintf("%s %ss %s",
					$transition[$j]['property'],
					$transition[$j]['duration'],
					$transition[$j]['timing']
				);
			}
			$css .= sprintf("	transition: %s;\n", $value);
			$css .= sprintf("	-moz-transition: %s;\n", $value);
			$css .= sprintf("	-webkit-transition: %s;\n", $value);
			$css .= "}\n\n";
		}
		$css .= docPublishMakeTransitionCSS($objects[$i]['items']);
	}
	return $css;
}

function docPublishMakeStyleCSS($data) {
	global $IMAGE_LIST;

	$css = "body {\n";
	foreach ($data['css'] as $key => $value) {
		if ($value[0] === '') continue;
		switch (strtolower($key)) {
			case 'background-image':
				if ($value[0] != '') {
					$css .= sprintf("	%s: url(../images/%s);\n", $key, $value[0]);
					if (!is_array($IMAGE_LIST)) $IMAGE_LIST = array();
					$IMAGE_LIST[] = $value[0];
				}
				break;
			default:
				if (isset($value[1])) {
					if ($value[0] == 'auto' || $value[0] == 'transparent' || $value[0] == 'initial' || $value[0] == 'inherit') {
						$css .= sprintf("	%s: %s;\n", $key, $value[0]);
					} else {
						$css .= sprintf("	%s: %s%s;\n", $key, $value[0], $value[1]);
					}
				} else {
					$css .= sprintf("	%s: %s;\n", $key, $value[0]);
				}
				break;
		}
	}
	$css .= "	padding: 0;\n	margin: 0;\n	position: relative;\n}\n\n";
	$css .= docPublishMakeTransitionCSS($data['objects']);

	return $css;
}

function docPublishMakeObjectJS($docid, $objects, $outputPath) {
	global $PREVIEW, $IMAGE_LIST;

	$objectCnt = (is_array($objects)) ? count($objects) : 0;

	$js = "";
	for ($i = 0; $i < $objectCnt; $i++) {
		$data = array();
		$dataCss = array();
		foreach ($objects[$i]['css'] as $key => $value) {
			if ($value[0] === '') $value[0] = 'initial';

			if (isset($value[1])) {
				if ($value[0] == 'auto' || $value[0] == 'transparent' || $value[0] == 'initial' || $value[0] == 'inherit') {
					$dataCss[$key] = $value[0];
				} else {
					$dataCss[$key] = $value[0].$value[1];
				}
			} else {
				if ($key == 'background-image' && $value[0] != 'initial') {
					if (!is_array($IMAGE_LIST)) $IMAGE_LIST = array();
					$IMAGE_LIST[] = $value[0];
				}
				$dataCss[$key] = $value[0];
			}
		}
		$data['id'] = $objects[$i]['id'];
		$data['type'] = $objects[$i]['type'];
		$data['css'] = $dataCss;
		$data['data'] = $objects[$i]['data'];

		if ($data['type'] == 'image') {
			$images = array();
			$imageCnt = (is_array($data['data']['image']['list'])) ? count($data['data']['image']['list']) : 0;
			for ($j = 0; $j < $imageCnt; $j++) {
				$image = $data['data']['image']['list'][$j];
				if ($image['type'] == 'link') {
					if (!$PREVIEW) {
						$url = $image['name'];
						$image['name'] = basename($image['name']);
						$image['type'] = 'server';
						$imagePath = sprintf('%s/images/%s', $outputPath, $image['name']);
						file_put_contents($imagePath, file_get_contents($url));
					} else {
						$imagePath = $image['name'];
					}
				} else if ($image['type'] == 'server') {
					$imagePath = sprintf('%s/%s', pathGetImageDir($docid), $image['name']);
				} else continue;

				$size = getimagesizeEx($imagePath);
				if (!$size) continue;
				$image['width'] = $size[0];
				$image['height'] = $size[1];

				$images[] = $image;

				if ($image['type'] == 'server') {
					if (!is_array($IMAGE_LIST)) $IMAGE_LIST = array();
					$IMAGE_LIST[] = $image['name'];
				}
			}
			$data['data']['image']['list'] = $images;
		}
		$js .= sprintf("G_OBJECT_DATA['%s'] = %s;\n", $objects[$i]['id'], json_encode($data));
		$js .= docPublishMakeObjectJS($docid, $objects[$i]['items'], $outputPath);
	}
	return $js;
}

function docPublishMakeDataJS($data, $outputPath) {
	global $PREVIEW, $IMAGE_LIST;

	$config = array(
		'id' => $data['id'],
		'title' => $data['title'],
		'orientation' => $data['orientation'],
		'images' => $PREVIEW ? pathGetPreviewDir($data['id'], 'image') : 'images/',
		'audio' => $PREVIEW ? pathGetPreviewDir($data['id'], 'audio') : 'media/audio/',
		'video' => $PREVIEW ? pathGetPreviewDir($data['id'], 'video') : 'media/video/'
	);
	$js  = "var G_CONF = ".json_encode($config).";\n";
	$js .= "var G_OBJECT_DATA = {};\n\n";

	$js .= docPublishMakeObjectJS($data['id'], $data['objects'], $outputPath);
	$js .= "\n";

	$js .= sprintf("var G_BODY_DATA = %s;\n", json_encode($data['data']));
	$js .= "var G_IMAGE_LIST = [];\n";

	$imageCnt = (is_array($IMAGE_LIST)) ? count($IMAGE_LIST) : 0;
	for ($i = 0; $i < $imageCnt; $i++) {
		$js .= sprintf("G_IMAGE_LIST.push('%s');\n", $IMAGE_LIST[$i]);
	}
	$js .= "\n";

	if ($data['data']['script']) {
		$funcs = $data['data']['script'];
		$funcCnt = (is_array($funcs)) ? count($funcs) : 0;

		for ($i = 0; $i < $funcCnt; $i++) {
			if (!$funcs[$i]['type']) $funcs[$i]['type'] == 'source'; // FIXME!

			if ($funcs[$i]['type'] != 'source') continue;

			$js .= sprintf("function userfunc_%s(obj) {\n", $funcs[$i]['name']);
			$js .= sprintf("%s\n", $funcs[$i]['source']);
			$js .= "}\n\n";
		}
	}
	return $js;
}

function docPublishMakeObjectHTML($objects, $depth = 0) {
	$objectCnt = (is_array($objects)) ? count($objects) : 0;

	$html = "";
	for ($i = 0; $i < $objectCnt; $i++) {
		for ($j = 0; $j < $depth; $j++) $html .= "\t";
		$html .= sprintf("<div id=\"%s\" class=\"object\">\n", $objects[$i]['id']);
		if ($objects[$i]['type'] == 'box') {
			$html .= docPublishMakeObjectHTML($objects[$i]['items'], $depth + 1);
		}
		for ($j = 0; $j < $depth; $j++) $html .= "\t";
		$html .= "</div>\n";
	}
	return $html;
}

function docPublishMakeMainHTML($data, $outputPath) {
	global $PREVIEW;

	$html  = "<!DOCTYPE html>\n";
	$html .= "<html>\n";
	$html .= "<head>\n";
	$html .= "<meta charset=\"UTF-8\">\n";
	$html .= "<meta name=\"Created\" content=\"Powered by INEditor\">\n";
	$html .= sprintf("<meta name=\"DocumentID\" content=\"%s\">\n", $data['id']);
	if ($data['orientation'] == 'landscape') {
		$html .= "<meta name=\"viewport\" content=\"user-scalable=no,height=device-height,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0\">\n";
	} else {
		$html .= "<meta name=\"viewport\" content=\"user-scalable=no,width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0\">\n";
	}
	$html .= "<meta http-equiv=\"Content-Script-Type\" content=\"text/javascript\">\n";
	$html .= "<meta http-equiv=\"Content-Style-Type\" content=\"text/css\">\n";
	$html .= "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n";
	$html .= sprintf("<title>%s</title>\n", $data['title']);
	$html .= sprintf("<link rel=\"stylesheet\" type=\"text/css\" href=\"%scss/in-object.css\">\n", ($PREVIEW) ? '../lib/publish/' : '');

	if (!$PREVIEW) {
		$html .= "<link rel=\"stylesheet\" type=\"text/css\" href=\"css/style.css\">\n";
	} else {
		$html .= "<link rel=\"stylesheet\" type=\"text/css\" href=\"preview.php?fn=css\">\n";
	}

	if (!file_exists(sprintf('%s/js/in-doc.min.js', $outputPath))) {
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/jquery-2.1.3.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/jquery.keyframes.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/prefixfree.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-misc.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-main.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-object.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-scroller.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-audio.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-event.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-image.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-video.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
	} else {
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/jquery-2.1.3.min.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/jquery.keyframes.min.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/prefixfree.min.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
		$html .= sprintf("<script type=\"text/javascript\" src=\"%sjs/in-doc.min.js\"></script>\n", ($PREVIEW) ? '../lib/publish/' : '');
	}
	if (!$PREVIEW) {
		$html .= "<script type=\"text/javascript\" src=\"js/data.js\"></script>\n";
	} else {
		$html .= "<script type=\"text/javascript\" src=\"preview.php?fn=js\"></script>\n";
	}

	if ($data['data']['script']) {
		$scriptCnt = (is_array($data['data']['script'])) ? count($data['data']['script']) : 0;
		for ($i = 0; $i < $scriptCnt; $i++) {
			if ($data['data']['script'][$i]['type'] != 'link') continue;

			if (!$PREVIEW) {
				$dnFile = sprintf('%s/js/%s', $outputPath, $data['data']['script'][$i]['name']);
				$dnScript = file_get_contents($data['data']['script'][$i]['source']);
				if (!$dnScript) continue;

				if (!file_put_contents($dnFile, $dnScript)) {
					continue;
				}
				$html .= sprintf("<script type=\"text/javascript\" src=\"js/%s\"></script>\n", $data['data']['script'][$i]['name']);
			} else {
				$html .= sprintf("<script type=\"text/javascript\" src=\"%s\"></script>\n", $data['data']['script'][$i]['source']);
			}
		}
	}
	$html .= "</head>\n";
	$html .= "<body>\n";

	// loading splash
	$html .= "<table class=\"loading white\">\n";
	$html .= "	<tr><td>\n";
	$html .= "		<div class=\"spinner\">\n";
	$html .= "			<span></span>\n";
	$html .= "			<span></span>\n";
	$html .= "			<span></span>\n";
	$html .= "			<span></span>\n";
	$html .= "		</div>\n";
	$html .= "	</td></tr>\n";
	$html .= "</table>\n";

	$html .= docPublishMakeObjectHTML($data['objects'], 0);
	$html .= "</body>\n";
	$html .= "</html>";

	return $html;
}

function docPublishMakeZip($path, $output) {
	global $ERROR;

	$fileList = getFileList($path);

	if (file_exists($output)) unlink($output);

	$zip = new ZipArchive();
	if ($zip->open($output, ZIPARCHIVE::CREATE) !== true) {
		$ERROR = 'DOPU0011';
		return false;
	}
	foreach($fileList as $file) {
		if (!$zip->addFile($path.'/'.$file, $file)) {
			$ERROR = 'DOPU0012';
			return false;
		}
	}
	$zip->close();

	return true;
}
?>
