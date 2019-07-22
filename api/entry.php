<?php
require_once 'database.php';
//time entries
class Entry{
    
    private $sql;
    
    /** connect to database **/
    function __construct($sql = false){
        if(!$sql){
            $sql = new Database();
        }
        $this->sql = $sql;
    }
    
    /** format result **/
    function formatResult($result){
        $return = [];
        
        while($row = $result->fetch_assoc()){
            $return[] = $row;
        }
        
        return $return;
    }
    
    /** get all user's entries per job **/
    function getEntries($userId, $jobId){
        return $this->formatResult($this->sql->prepare('SELECT * FROM entries WHERE userId = ? AND jobId = ? ORDER BY clockedIn ASC')->bindString($userId)->bindString($jobId)->execute()->getResult());
    }
    
    /** create new entry **/
    function createEntry($userId, $jobId, $length){
        require_once $_SERVER['DOCUMENT_ROOT'] . '/../other/randomKey.php';
        
        $entryId = '';
        $break = 1000;
        $keyExists = $this->sql->prepare('SELECT 1 FROM entries WHERE entryId = ? LIMIT 1');
        
        do{
            $entryId = generateKey(32);
            $keyExists->bindString($entryId);
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while($keyExists->execute()->getResult()->num_rows);
        
        $this->sql->prepare('INSERT INTO entries(entryId, userId, jobId, length) VALUES(?, ?, ?, ?)')->bindString($entryId)->bindString($userId)->bindString($jobId)->bindInt($length)->execute();
        
        return $entryId;
    }
    
    /** get entry **/
    function getEntry($userId, $entryId){
        return $this->formatResult($this->sql->prepare('SELECT * FROM entries WHERE entryId = ? AND userId = ?')->bindString($entryId)->bindString($userId)->execute()->getResult());
    }
}