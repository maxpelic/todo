<?php
function generateKey($length = 64){
    $string = bin2hex(random_bytes(ceil($length/2)));
    return substr($string, 0, $length);
}