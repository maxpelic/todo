<?php
require_once 'database.php';
//user actions
class User{
    
    private $sql;
    private $loginMaxAge;
    
    /** connect to database **/
    function __construct($sql = false){
        if(!$sql){
            $sql = new Database();
        }
        $this->sql = $sql;
        $this->loginMaxAge = date('Y-m-d', strtotime("-1 year", time()));
    }
    
    /** log user in to site **/
    function logUserIn($userId){
        require_once $_SERVER['DOCUMENT_ROOT'] . '/../other/randomKey.php';
        
        $cookieKey = '';
        $break = 1000;
        
        $cookieExists = $this->sql->prepare('SELECT 1 FROM user_logins WHERE loggedIn = TRUE AND cookie = ? AND dateLogged > ? LIMIT 1');
        
        do{
            $cookieKey = generateKey(32);
            $cookieExists->bindString($cookieKey)->bindString($this->loginMaxAge)->execute();
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while ($cookieExists->getResult()->num_rows);
        
        if(!setcookie('heyo', $cookieKey, time() + 60 * 60 * 24 * 360)) return false;
        
        return $this->sql->prepare('INSERT INTO user_logins(userId, cookie, loggedIn) VALUES(?, ?, TRUE)')->bindString($userId)->bindString($cookieKey)->execute();
    }
    
    /** log user out **/
    function logUserOut(){
        if(isset($_COOKIE['heyo'])){
            $this->sql->prepare('UPDATE user_logins SET loggedIn = FALSE WHERE cookie = ?')->bindString($_COOKIE['heyo'])->execute();
        }
        return setcookie('heyo', null, -1);
    }
    
    /** check user login status **/
    function getUserId(){
        if(empty($_COOKIE['heyo'])) return false;
        
        $userIdResult = $this->sql->prepare('SELECT userId FROM user_logins WHERE cookie = ? AND loggedIn = TRUE AND dateLogged > ? LIMIT 1')->bindString($_COOKIE['heyo'])->bindString($this->loginMaxAge)->execute()->getResult();
        
        if(!$userIdResult->num_rows) return false;
        
        return $userIdResult->fetch_assoc()['userId'];
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
        
        $userExists = $this->sql->prepare('SELECT userId FROM user_accounts WHERE googleId = ? LIMIT 1')->bindString($googleId)->execute()->getResult();
        
        if($userExists->num_rows){
            return $this->logUserIn($userExists->fetch_assoc()['userId']);
        }
        
        //user does not have an account yet, create one
        
        //generate key
        require_once '../other/randomKey.php';
        $keyExists = $this->sql->prepare('SELECT 1 FROM user_accounts WHERE userId = ? LIMIT 1');
        $userId = '';
        $break = 1000;
        do{
            $userId = generateKey(64);
            $keyExists->bindString($userId)->execute();
            if($break-- < 0){
                throw new Error('Infinite loop');
            }
        } while ($keyExists->getResult()->num_rows);
        
        $userAccount = $this->sql->prepare('INSERT INTO user_accounts(googleId, userId, email) VALUES(?, ?, ?)')->bindString($googleId)->bindString($userId)->bindString($payload['email'])->execute();
        
        if($this->sql->getAffectedRows()){
            return $this->logUserIn($userId);
        }
        
        return 0;
    }
    
}