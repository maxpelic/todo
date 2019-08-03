<?php
require getenv('API_URL') . '/user.php';

$user = new User();

if($user->logUserOut()){
    echo 'User logged out';
    exit;
}

//don't throw an error message since user is probably logged out
echo 'Error logging user out';