<?php

define("BP", __DIR__);

$filename = "/archive/" . rand(99999, 999999) . ".zip";

$files = isset($_POST['files']) ? $_POST['files'] : [];

if ((array)$files !== $files || empty($files)) {
	throw new Exception("Files list empty");
}

$zip = new ZipArchive();
$zip->open(BP . $filename, ZipArchive::CREATE);

foreach ($files as $n => $file) {
	if ($file_dir = realpath(BP . $file)) {
		$zip->addFile($file_dir, ($n + 1) . "." . pathinfo($file_dir, PATHINFO_EXTENSION));
	}
}

$zip->close();

header('Content-Type: application/json');

echo json_encode([
	'success' => true,
	'file' => $filename
]);
