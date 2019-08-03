<?php
require getenv('API_URL') . '/database.php';
require getenv('API_URL') . '/user.php';

if(empty($_GET['jobId'])){
    header('HTTP/1.0 400 Bad Request');
    exit;
}

$sql = new Database();

$user = new User($sql);

$userId = $user->getUserId();

if(!$userId){
    header('HTTP/1.0 401 User is not logged in');
    exit;
}

require getenv('API_URL') . '/entry.php';

$entry = new Entry($sql);

header('Content-type:application/json');

echo json_encode($entry->getEntries($userId, $_GET['jobId']));