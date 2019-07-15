<?php
require_once 'database.php';
//user actions
class User{
    
    private $sql;
    
    /** connect to database **/
    function __construct($sql = false){
        if(!$sql){
            $sql = new Database();
        }
        $this->sql = $sql;
    }
    
    /** log user in to site **/
    function logUserIn($userId){
        $cookieKey = $this->generateKey(32);
        
        if(setcookie('heyo', $cookieKey, time() + 60 * 60 * 24 * 360))
        
        return $this->sql->prepare('INSERT INTO user_logins(userId, cookie, loggedIn) VALUES(?, ?, TRUE)')->bindString($userId)->bindString($cookieKey)->execute();
    }
    
    /** login user in with google id **/
    function loginWithGoogle($id_token){
        require_once $_SERVER['DOCUMENT_ROOT'] . '/../google-api-php-client/vendor/autoload.php';
        
        $client = new Google_Client(['client_id' => getenv('GOOGLE_LOGIN_CLIENT_ID')]);
        
        $payload = $client->verifyIdToken($id_token);
        
        if(!$payload || empty($payload['sub'])){
            return false;
        }
        
        //check for user
        $googleId = $payload['sub'];
        print_r($payload);
        
        $userExists = $this->sql->prepare('SELECT ID FROM user_accounts WHERE googleId = ? LIMIT 1')->bindString($googleId)->execute()->getResult();
        
        if($userExists->num_rows){
            return $this->logUserIn($userExists->fetch_assoc()['ID']);
        }
        
        //user does not have an account yet, create one
        
        //generate key
        $keyExists = $this->sql->prepare('SELECT 1 FROM user_accounts WHERE ID = ? LIMIT 1');
        $userId = '';
        $break = 1000;
        do{
            $userId = $this->generateKey(64);
            $keyExists->bindString($userId)->execute();
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while ($keyExists->getResult()->num_rows);
        
        $userAccount = $this->sql->prepare('INSERT INTO user_accounts(googleId, ID, email) VALUES(?, ?, ?)')->bindString($googleId)->bindString($userId)->bindString($payload['email'])->execute();
        
        if($this->sql->getAffectedRows()){
            return $this->logUserIn($userId);
        }
        
        return 0;
    }
    
    /** generate random key **/
    function generateKey($length = 64){
        $string = bin2hex(random_bytes(ceil($length/2)));
        return substr($string, 0, $length);
    }
    
}