<?php

include 'config.php';
require_once 'validate_username.php';

// checks form input of data to be sure it is safe
// http://www.w3schools.com/php/php_form_validation.asp
/**
 * Returns a safe version of form input
 *
 * @param unknown $data String of data to be checked
 * @return string safe version of data
 */
function sanitize_input($data)
{
	return htmlspecialchars(stripslashes(trim($data)));
}

include_once "validate_user.php";

// Collect all Details from Angular HTTP Request.
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$user = $request->user;
@$id = sanitize_input($user->id);
@$key = sanitize_input($user->key);

// Validate the id:key pair
if (!validateUser($id, $key)) {
  echo "Unable to validate id[$id] with key[$key]";
  return;
}

$record = $request->fields;

$data = json_encode( array( $record ) );

$fields = array(
  'token'   => $GLOBALS['api_token'],
  'content' => 'record',
  'format'  => 'json',
  'type'    => 'flat',
  'data'    => $data,
);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $GLOBALS['api_url']);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_CAINFO, $GLOBALS['ca_cert']);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));

$output = curl_exec($ch);
print $output;
curl_close($ch);

