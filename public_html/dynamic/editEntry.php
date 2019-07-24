<?php
require getenv('API_URL') . '/database.php';
require getenv('API_URL') . '/user.php';

if(empty($_POST['length']) || empty($_POST['jobId'])){
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

$entryId;

//if no item specified, create new item
if(!empty($_POST['entryId'])){
    $entryId = $_POST['entryId'];
} else {
    $entryId = $entry->createEntry($userId, $_POST['jobId'], (int)$_POST['length']);
}

//update entry
$fields = [
    'clockedIn'=>'date',
    'length'=>'int',
    'jobId'=>'string',
    'description'=>'string'    
];

foreach($fields as $field=>$type){
    
    if(!isset($_POST[$field])) continue;
    
    $value = $_POST[$field];
    
    $updateQuery = $sql->prepare("UPDATE entries SET $field = ? WHERE entryId = ? AND userId = ?");
    
    if($type === 'date'){
        $value = $value ? date('Y-m-d g:i:s', (strtotime($value))) : '';
        $type = 'string';
    }
    
    if($type === 'int'){
        $updateQuery->bindInt((int)$value);
    } else {
        $updateQuery->bindString($value);
    }
    
    $updateQuery->bindString($entryId);
    $updateQuery->bindString($userId);
    
    $updateQuery->execute();
    
}

header('Content-type: application/json');

echo json_encode($entry->getEntry($userId, $entryId));