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

require getenv('API_URL') . '/item.php';

$item = new Item($sql);

$itemId;

//if no item specified, create new item
if(!empty($_POST['itemId'])){
    $itemId = $_POST['itemId'];
} else {
    $itemId = $item->createItem($userId);
}

$fields = [
    'jobId'=>'string',
    'archived'=>'boolean',
    'title'=>'string',
    'status'=>'int',
    'description'=>'string',
    'due'=>'date',
    'priority'=>'int'
];

foreach($fields as $field=>$type){
    
    if(!isset($_POST[$field])) continue;
    
    $value = $_POST[$field];
    
    $updateQuery = $sql->prepare("UPDATE items SET $field = ? WHERE itemId = ? AND userId = ?");
    
    if($type === 'boolean'){
        $value = $value === 'true' ? 1 : $value === 'false' ? 0 : (int)$value;
        $type = 'int';
    }
    
    if($type === 'date'){
        $value = $value ? date('Y-m-d g:i:s', strtotime($value)) : '';
        $type = 'string';
    }
    
    if($type === 'int'){
        $updateQuery->bindInt((int)$value);
    } else {
        $updateQuery->bindString($value);
    }
    
    $updateQuery->bindString($itemId);
    $updateQuery->bindString($userId);
    
    $updateQuery->execute();
    
}

header('Content-type: application/json');

echo json_encode($item->getItem($userId, $itemId));