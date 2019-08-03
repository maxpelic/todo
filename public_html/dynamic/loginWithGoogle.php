<?php

header('HTTP/1.0 500 Server Error');

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    header('HTTP/1.0 405 Method Not Allowed');
    exit;
}

$id_token = isset($_POST['id_token']) ? $_POST['id_token'] : '';

if(!$id_token){
    header('HTTP/1.0 400 Bad Request');
    exit;
}

require getenv('API_URL') . '/user.php';

$userObject = new User();

if($userObject->loginWithGoogle($id_token)){
    header('HTTP/1.0 200 Ok');
    echo 'User logged in';
    exit;
}

header('HTTP/1.0 401 Unauthorized');
