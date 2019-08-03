<?php
require getenv('API_URL') . '/user.php';

$user = new User();

if($user->getUserId()){
    echo 'User is logged in';
    exit;
}

header('HTTP/1.0 401 User is not logged in');