<?php
function docLoadList($data) {
	global $ERROR, $RESPONSE;

	$path = pathGetDataDir();
	if (!$path) {
		$RESPONSE['list'] = array();
		return;
	}

	$list = array();
	if (file_exists($path) && $dirs = opendir($path)) {
		while (($dir = readdir($dirs)) !== false) {
			$fullPath = sprintf('%s/%s', $path, $dir);

			if ($dir[0] == '.') continue;
			if (!is_dir($fullPath)) continue;

			$fileInfo = sprintf('%s/%s.info', $fullPath, $dir);
			if (!file_exists($fileInfo)) continue;

			$info = docLoadInfoXML($fileInfo);
			if (!$info) continue;

			$id = $info['id'];
			$title = $info['title'];
			$orientation = $info['orientation'];
			$preview = $info['preview'];

			$mdate = filemtime($fullPath);
			if (!$mdate) $mdate = fileatime($fullPath);
			$list[] = array(
				'id' => $id,
				'name' => $title,
				'date' => ($mdate) ? date('Y-m-d', $mdate) : '',
				'timestamp' => $mdate,
				'preview' => $preview,
				'orientation' => $orientation
			);
		}
		closedir($dirs);
	}
	usort($list, create_function('$a,$b', 'return filemtime($a["timestamp"]) < filemtime($b["timestamp"]);'));

	$RESPONSE['list'] = $list;
}

function docSave($recvData) {
	global $ERROR, $RESPONSE;

	$jsonData = $recvData['jsonData'];
	$rawData = json_decode($jsonData, true);

	$oldid = $rawData['oldid'];
	$title = $rawData['title'];
	$editMode = $rawData['editMode'];
	$orientation = $rawData['orientation'];
	$ratio = $rawData['ratio'];

	if ($oldid || $editMode == 'new') {
		$id = $rawData['id'] = generateGuid();
	} else {
		$id = $rawData['id'];
	}
	$path = pathGetDocDir($id);
	$fileDoc = sprintf('%s/%s.indoc', $path, $id);
	$fileInfo = sprintf('%s/%s.info', $path, $id);

	if ($oldid) {
		$oldPath = pathGetDocDir($oldid);
		if (file_exists($path)) {
			$ERROR = 'DOCU0003';
			return;
		}
		if (file_exists($oldPath)) {
			if ($editMode == 'new') {
				if (!rename($oldPath, $path)) {
					$ERROR = 'DOCU0001';
					return;
				}
			} else {
				if (!copyAll($oldPath, $path)) {
					$ERROR = 'DOCU0002';
					return;
				}
			}
		} else {
			if (!mkdir($path, 0777, true)) {
				$ERROR = 'DOCU0006';
				return;
			}
		}
	}
	$xmlInfo = docSaveInfoXML($rawData);
	$xmlDoc = docSaveMakeXML($rawData);

	if (!file_put_contents($fileInfo, $xmlInfo)) {
		$ERROR = 'DOCU0004';
		return;
	}
	if (!file_put_contents($fileDoc, $xmlDoc)) {
		$ERROR = 'DOCU0005';
		return;
	}
	$RESPONSE['id'] = $id;
	$RESPONSE['title'] = $title;
	$RESPONSE['orientation'] = $orientation;
	$RESPONSE['ratio'] = $ratio;
}

function docSaveInfoXML($data) {
	$editor = $data['editor'];
	$version = $data['version'];

	$id = $data['id'];
	$title = $data['title'];
	$orientation = $data['orientation'];
	$preview = $data['preview'];

	// INDocument
	$xml = new DOMDocument("1.0", "UTF-8");
	$doc = $xml->createElement("INDocumentInfo");
	$xml->appendChild($doc);

	$doc->setAttribute("editor", $editor);
	$doc->setAttribute("version", $version);

	// INDocument/info
	$docInfo = $xml->createElement('info');
	$doc->appendChild($docInfo);

	// INDocument/info/id
	$docId = $xml->createElement('id');
	$docId->appendChild($xml->createCDATASection($id));
	$docInfo->appendChild($docId);

	// INDocument/info/title
	$docTitle = $xml->createElement('title');
	$docTitle->appendChild($xml->createCDATASection($title));
	$docInfo->appendChild($docTitle);

	// INDocument/info/title
	$docOrientation = $xml->createElement('orientation');
	$docOrientation->appendChild($xml->createCDATASection($orientation));
	$docInfo->appendChild($docOrientation);

	// INDocument/preview
	$docPreview = $xml->createElement('preview');
	$docPreview->appendChild($xml->createCDATASection($preview));
	$doc->appendChild($docPreview);

	return $xml->saveXML();
}

function docSaveMakeXML($data) {
	$editor = $data['editor'];
	$version = $data['version'];

	$id = $data['id'];
	$title = $data['title'];
	$orientation = $data['orientation'];
	$ratio = $data['ratio'];
	$bgCss = $data['css'];
	$objects = $data['objects'];

	// INDocument
	$xml = new DOMDocument("1.0", "UTF-8");
	$doc = $xml->createElement("INDocument");
	$xml->appendChild($doc);

	$doc->setAttribute("editor", $editor);
	$doc->setAttribute("version", $version);

	// INDocument/info
	$docInfo = $xml->createElement('info');
	$doc->appendChild($docInfo);

	// INDocument/info/id
	$docId = $xml->createElement('id');
	$docId->appendChild($xml->createCDATASection($id));
	$docInfo->appendChild($docId);

	// INDocument/info/title
	$docTitle = $xml->createElement('title');
	$docTitle->appendChild($xml->createCDATASection($title));
	$docInfo->appendChild($docTitle);

	// INDocument/info/orientation
	$docOrientation = $xml->createElement('orientation');
	$docOrientation->appendChild($xml->createCDATASection($orientation));
	$docInfo->appendChild($docOrientation);

	// INDocument/info/ratio
	$docRatio = $xml->createElement('ratio');
	$docRatio->appendChild($xml->createCDATASection($ratio));
	$docInfo->appendChild($docRatio);

	// INDocument/background
	$docBackground = $xml->createElement('background');
	$doc->appendChild($docBackground);

	foreach ($bgCss as $key => $value) {
		$docBackgroundStyle = $xml->createElement('style');
		$docBackgroundStyle->setAttribute("key", $key);
		if (is_array($value)) {
			if (count($value) > 1) {
				$docBackgroundStyle->setAttribute("value", $value[0]);
				$docBackgroundStyle->setAttribute("unit", $value[1]);
			} else {
				$docBackgroundStyle->setAttribute("value", $value[0]);
			}
		} else {
			$docBackgroundStyle->setAttribute("value", $value);
		}
		$docBackground->appendChild($docBackgroundStyle);
	}

	// INDocument/data
	$docData = docSaveMakeDataXML($xml, $data['data'], 'data');
	$doc->appendChild($docData);

	// INDocument/objects
	$docObjects = docSaveMakeObjectXML($xml, $objects, 'objects');
	$doc->appendChild($docObjects);

	return $xml->saveXML();
}

function docSaveMakeObjectXML($xml, $objects, $nodeName = 'items') {
	$docNode = $xml->createElement($nodeName);

	$objectCnt = (is_array($objects)) ? count($objects) : 0;
	for ($i = 0; $i < $objectCnt; $i++) {
		$docObject = $xml->createElement('object');
		$docObject->setAttribute('id', $objects[$i]['id']);
		$docObject->setAttribute('type', $objects[$i]['type']);
		$docObject->setAttribute('lockMove', ($objects[$i]['lockMove']) ? 1 : 0);
		$docObject->setAttribute('lockResize', ($objects[$i]['lockResize']) ? 1 : 0);

		$docStyles = $xml->createElement('styles');
		$docObject->appendChild($docStyles);
		foreach ($objects[$i]['css'] as $key => $value) {
			$docStyle = $xml->createElement('style');
			$docStyle->setAttribute("key", $key);
			if (is_array($value)) {
				if (count($value) > 1) {
					$docStyle->setAttribute("value", $value[0]);
					$docStyle->setAttribute("unit", $value[1]);
				} else {
					$docStyle->setAttribute("value", $value[0]);
				}
			} else {
				$docStyle->setAttribute("value", $value);
			}
			$docStyles->appendChild($docStyle);
		}
		$docItems = docSaveMakeObjectXML($xml, $objects[$i]['items']);
		$docObject->appendChild($docItems);

		$docData = docSaveMakeDataXML($xml, $objects[$i]['data'], 'data');
		$docObject->appendChild($docData);

		$docNode->appendChild($docObject);
	}
	return $docNode;
}

function docSaveMakeDataXML($xml, $data, $nodeName) {
	$docNode = $xml->createElement($nodeName);

	if (is_array($data)) {
		if (isset($data[0])) {
			$docNode->setAttribute("type", 'array');

			$dataCnt = (is_array($data)) ? count($data) : 0;
			for ($i = 0; $i < $dataCnt; $i++) {
				$docItem = docSaveMakeDataXML($xml, $data[$i], 'item');
				$docNode->appendChild($docItem);
			}
		} else {
			$docNode->setAttribute("type", 'object');
			foreach ($data as $key => $value) {
				$docItem = docSaveMakeDataXML($xml, $value, $key);
				$docNode->appendChild($docItem);
			}
		}
	} else {
		$docNode->setAttribute("type", 'value');
		$docNode->appendChild($xml->createCDATASection($data));
	}
	return $docNode;
}

function docLoad($recvData) {
	global $ERROR, $RESPONSE;

	$id = $recvData['id'];

	$path = pathGetInDocPath($id);
	if (!file_exists($path)) {
		$ERROR = 'DOCU0007';
		return;
	}
	$data = docLoadXML($path);

	$RESPONSE['docData'] = $data;
}

function docLoadInfoXML($path) {
	$xml = simplexml_load_file($path);

	return array(
		'id' => (string)$xml->info->id,
		'title' => (string)$xml->info->title,
		'orientation' => (string)$xml->info->orientation,
		'preview' => (string)$xml->preview
	);
}

function docLoadXML($path) {
	$xml = simplexml_load_file($path);

	$retData = array();
	$retData['id'] = (string)$xml->info->id;
	$retData['title'] = (string)$xml->info->title;
	$retData['orientation'] = (string)$xml->info->orientation;
	$retData['ratio'] = (string)$xml->info->ratio;

	$retData['css'] = array();
	$retData['objects'] = array();

	foreach ($xml->background->style as $style) {
		$attr = array();
		foreach ($style->attributes() as $key => $val) {
			$attr[$key] = (string)$val;
		}
		if (!isset($attr['key']) || !isset($attr['value'])) continue;

		$key = $attr['key'];
		$retData['css'][$key] = array($attr['value']);
		if (isset($attr['unit'])) {
			$retData['css'][$key][] = $attr['unit'];
		}
	}
	$retData['data'] = docLoadDataXML($xml->data);

	foreach ($xml->objects->object as $object) {
		$data = docLoadObjectXML($object);
		$retData['objects'][] = $data;
	}
	return $retData;
}

function docLoadObjectXML($xml) {
	$data = array();

	foreach ($xml->attributes() as $key => $val) {
		if ($key == 'lockMove' || $key == 'lockResize') {
			$data[$key] = (((string)$val) == '1') ? true : false;
		} else {
			$data[$key] = (string)$val;
		}
	}

	$data['css'] = array();
	foreach ($xml->styles->style as $style) {
		$attr = array();
		foreach ($style->attributes() as $key => $val) {
			$attr[$key] = (string)$val;
		}
		if (!isset($attr['key']) || !isset($attr['value'])) continue;

		$key = $attr['key'];
		$data['css'][$key] = array($attr['value']);
		if (isset($attr['unit'])) {
			$data['css'][$key][] = $attr['unit'];
		}
	}

	$data['items'] = array();
	foreach ($xml->items->object as $object) {
		$dataObj = docLoadObjectXML($object);
		$data['items'][] = $dataObj;
	}
	$data['data'] = docLoadDataXML($xml->data);

	return $data;
}

function docLoadDataXML($xml) {
	$type = (string)$xml['type'];

	if ($type == 'array') {
		$data = array();
		foreach ($xml->item as $item) {
			$data[] = docLoadDataXML($item);
		}
	} else if ($type == 'object') {
		$data = array();
		foreach ($xml->children() as $child) {
			$data[$child->getName()] = docLoadDataXML($child);
		}
	} else if ($type == 'value') {
		$data = (string)$xml;
	}
	return $data;
}

function docPublish($recvData) {
	global $ERROR, $RESPONSE;

	$id = $recvData['id'];

	$path = pathGetInDocPath($id);
	if (!file_exists($path)) {
		$ERROR = 'DOCU0008';
		return;
	}

	$target = pathGetPublishDir($id);
	if (!docPublishMakeHTML($path, $target)) {
		return false;
	}
	$zipName = sprintf('%s_%s.zip', date('YmdHis'), $id);
	$zip = pathGetPublishZipPath($zipName);

	if (!docPublishMakeZip($target, $zip)) {
		return false;
	}
	unlinkAll($target);

	$RESPONSE['zipUrl'] = sprintf('filedown.php?fn=publish/%s', $zipName);
}

function docPreview($recvData) {
	global $ERROR, $RESPONSE;

	$id = $recvData['id'];
	$data = json_decode($recvData['data'], true);

	$_SESSION['PREVIEW_DATA'] = $data;

	$RESPONSE['previewUrl'] = 'app/preview.php?fn=html';
}

function docDelete($recvData) {
	global $ERROR, $RESPONSE;

	$id = $recvData['id'];

	$path = pathGetDocDir($id);
	if (!file_exists($path)) {
		$ERROR = 'DOCU0009';
		return;
	}
	unlinkAll($path);
}
?>