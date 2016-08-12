<?php

print "<p>Testing</p>";

include 'config.php';

$fields = array(
	'token'   => $GLOBALS['api_token'],
	'content' => 'record',
  'format'  => 'json',
  'type' => 'flat',
  'records' => array('defaults'),
  'forms' => array('vandaidtest'),
  'rawOrLabel' => 'raw',
  'rawOrLabelHeaders' => 'raw',
  'exportCheckboxLabel' => 'false',
  'exportSurveyFields' => 'false',
  'exportDataAccessGroups' => 'false',
  'returnFormat' => 'json'
);

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_CAINFO, $GLOBALS['ca_cert']);

curl_setopt($ch, CURLOPT_URL, $GLOBALS['api_url']);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));

$output = curl_exec($ch);

print "<p>CURL executed. Output:</p>";

print $output;

$fp = fopen('../resources/defaults_record_export.json', 'w');
fwrite($fp, $output);
fclose($fp);

print "<p>File written</p>";

curl_close($ch);
