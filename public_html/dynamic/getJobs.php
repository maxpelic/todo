<?php
require getenv('API_URL') . '/database.php';
require getenv('API_URL') . '/user.php';

$sql = new Database();

$user = new User($sql);

$userId = $user->getUserId();

if(!$userId){
    header('HTTP/1.0 401 User is not logged in');
    exit;
}

require getenv('API_URL') . '/job.php';

$job = new Job($sql);

header('Content-type:application/json');

echo json_encode($job->getJobs($userId));