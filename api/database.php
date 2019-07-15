<?php
//database connection
class Database{
    
    private $connection;
    
    /** connect to database - $main = 'main' | 'admin' **/
    function __construct($database = 'main'){
        if($database === 'main'){
            $this->connection = new mysqli('localhost', getenv('DATABASE_MAIN_USER'), getenv('DATABASE_MAIN_PASSWORD'), getenv('DATABASE_MAIN_NAME'));
        } else if($database === 'admin'){
            $this->connection = new mysqli('localhost', getenv('DATABASE_ADMIN_USER'), getenv('DATABASE_ADMIN_PASSWORD'), getenv('DATABASE_ADMIN_NAME'));
        }
        
        if(!$this->connection || $this->connection->connect_errno){
            throw new Error('Unable to connect to database');
        }
    }
    
    /** prepare query - $query = sql to execute **/
    function prepare($query){        
        return new PreparedStatement($this->connection, $query);
    }   
    
    function getAffectedRows(){
        return $this->connection->affected_rows;
    }
    
    function getInsertId(){
        return $this->connection->insert_id;
    }
}

//prepared statement
class PreparedStatement{
    private $statement;
    private $types = '';
    private $bound = [];

    function __construct($connection, $query){
        $this->statement = $connection->prepare($query);
    }

    function bind($type, $value){
        $this->types .= $type;
        $this->bound[] = $value;
        return $this;
    }

    /** bind a string to the statement **/
    function bindString($string){
        return $this->bind('s', $string);
    }
    /** bind an int to the statement **/
    function bindInt($int){
        return $this->bind('i', $int);
    }
    /** execute the statement and return the result **/
    function execute(){
        
        $this->statement->bind_param($this->types, ...$this->bound);
        $this->statement->execute();
        
        $this->types = '';
        $this->bound = [];

        return $this;
    }
    
    /** get results **/
    function getResult(){
        return $this->statement->get_result();
    }
}