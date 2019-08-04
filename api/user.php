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
        $c = curl_init();
        
        curl_setopt($c, CURLOPT_URL, 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token));
        
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        
        $result = curl_exec($c);
        
        $result = json_decode($result);
        
        if(isset($result->error) || $result->aud !== '1078645540388-8u3469p3vl81sele8vm457mljrr56juj.apps.googleusercontent.com'){
            return 0;
        }
        
        $email = $result->email;
        
        $googleId = $result->sub;
        
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
        
        $this->sql->prepare('INSERT INTO user_accounts(googleId, userId, email) VALUES(?, ?, ?)')->bindString($googleId)->bindString($userId)->bindString($email)->execute();
        
        if($this->sql->getAffectedRows()){
            return $this->logUserIn($userId);
        }
        
        return 0;
    }
    
}