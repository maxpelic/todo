<?php
require_once 'database.php';
//jobs
class Job{
    
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
            $return[] = $row;
        }
        
        return $return;
    }
    
    /** get all user's jobs **/
    function getJobs($userId){
        $jobs = $this->sql->prepare('SELECT * FROM jobs WHERE userId = ? ORDER BY title DESC')->bindString($userId)->execute()->getResult();
        
        return $this->formatResult($jobs);
    }
    
    /** create new job **/
    function createJob($userId, $title, $hourlyRate){
        require_once $_SERVER['DOCUMENT_ROOT'] . '/../other/randomKey.php';
        
        $jobId = '';
        $break = 1000;
        $keyExists = $this->sql->prepare('SELECT 1 FROM jobs WHERE jobId = ? LIMIT 1');
        
        do{
            $jobId = generateKey(32);
            $keyExists->bindString($jobId);
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while($keyExists->execute()->getResult()->num_rows);
        
        $this->sql->prepare('INSERT INTO jobs(userId, jobId, title, hourlyRate) VALUES(?, ?, ?, ?)')->bindString($userId)->bindString($jobId)->bindString($title)->bindInt($hourlyRate)->execute();
        
        return $jobId;
    }
    
    /** get job **/
    function getJob($userId, $jobId){
        return $this->formatResult($this->sql->prepare('SELECT * FROM jobs WHERE jobId = ? AND userId = ?')->bindString($jobId)->bindString($userId)->execute()->getResult());
    }
}