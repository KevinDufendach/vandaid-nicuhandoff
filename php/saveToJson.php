<?php
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

$filenamePrefix = "../data/$key";

$fp = fopen("$filenamePrefix.data.json", 'w');
fwrite($fp, $data);
fclose($fp);

echo "saved to $filenamePrefix.data.json"; //this will go back under "data" of angular call.

?>
