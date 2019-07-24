<?php
require_once 'database.php';
//todo list items
class Item{
    
    private $sql;
    
    /** connect to database **/
    function __construct($sql = false){
        if(!$sql){
            $sql = new Database();
        }
        $this->sql = $sql;
    }
    
    /** format result into array **/
    function formatResult($result){
        $return = [];
        
        while($row = $result->fetch_assoc()){
            $row['due'] = $row['due'] ? date('Y-m-d', strtotime($row['due'])) : false;
            $return[] = $row;
        }
        
        return $return;
    }
    
    /** get all user's incomplete items **/
    function getIncompleteItems($userId){
        $items = $this->sql->prepare('SELECT * FROM items WHERE userId = ? AND archived = FALSE AND status <> 3 ORDER BY priority DESC, due DESC, created DESC')->bindString($userId)->execute()->getResult();
        
        return $this->formatResult($items);
    }
    
    /** create new item **/
    function createItem($userId){
        require_once $_SERVER['DOCUMENT_ROOT'] . '/../other/randomKey.php';
        
        $itemId = '';
        $break = 1000;
        $keyExists = $this->sql->prepare('SELECT 1 FROM items WHERE itemId = ? LIMIT 1');
        
        do{
            $itemId = generateKey(32);
            $keyExists->bindString($itemId);
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while($keyExists->execute()->getResult()->num_rows);
        
        $this->sql->prepare('INSERT INTO items(userId, itemId) VALUES(?, ?)')->bindString($userId)->bindString($itemId)->execute();
        
        return $itemId;
    }
    
    /** get item **/
    function getItem($userId, $itemId){
        return $this->formatResult($this->sql->prepare('SELECT * FROM items WHERE itemId = ? AND userId = ?')->bindString($itemId)->bindString($userId)->execute()->getResult());
    }
}