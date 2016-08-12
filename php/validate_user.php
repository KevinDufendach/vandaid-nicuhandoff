<?php
/**
 * Created by IntelliJ IDEA.
 * User: dufendkr
 * Date: 3/22/2016
 * Time: 10:55 AM
 */

/**
 * @param $id The username or id of the user
 * @param $key the key or password to check
 * @return bool Returns true if the id=>key combination exists, otherwise
 * returns false if the id or key does not exist or combination is invalid
 *
 * ToDo: Use an authentication standard other than simple key:value pairs
 */
function validateUser($id, $key)
{

  if (!isset($id, $key)) return false;

  $valid_users = array(
    'demo' => 'TEST_USER_SOFTWARE_KEY'
  );

  return (array_key_exists($id, $valid_users) && $valid_users[$id] == $key);
}
