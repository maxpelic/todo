<?php
require getenv('API_URL') . '/database.php';
require getenv('API_URL') . '/user.php';

if(empty($_POST['jobId']) || empty($_POST['title']) || empty($_POST['hourlyRate'])){
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

require getenv('API_URL') . '/job.php';

$job = new Job($sql);

foreach($_POST['jobId'] as $index=>$jobId){
    
    if(empty($_POST['title'][$index])) continue;

    //if no item specified, create new item
    if(!$jobId){
        $job->createJob($userId, $_POST['title'][$index], (float)$_POST['hourlyRate'][$index]);
        continue;
    }

    //update entry
    $fields = [
        'title'=>'string',
        'hourlyRate'=>'int',
    ];

    foreach($fields as $field=>$type){

        if(!isset($_POST[$field][$index])) continue;

        $value = $_POST[$field][$index];

        $updateQuery = $sql->prepare("UPDATE jobs SET $field = ? WHERE jobId = ? AND userId = ?");

        if($type === 'int'){
            $updateQuery->bindInt((int)$value);
        } else {
            $updateQuery->bindString($value);
        }

        $updateQuery->bindString($entryId);
        $updateQuery->bindString($userId);

        $updateQuery->execute();

    }
    
}

header('Content-type: application/json');

echo json_encode($job->getJobs($userId));