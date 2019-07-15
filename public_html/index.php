<!DOCTYPE html>
<html>
    <head>
        <title>Title Pending</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script async defer src="js/all.js"></script>
        <script src="https://apis.google.com/js/platform.js?onload=loadGoogle" async defer></script>
        <meta name="dynamicUrl" content="<?php echo htmlspecialchars(getenv('DYNAMIC_URL')); ?>">
        <meta name="google-signin-client_id" content="<?php echo getenv('GOOGLE_LOGIN_CLIENT_ID'); ?>">
    </head>
    <body>
        <a id="logoutLink" href="<?php echo getenv('DYNAMIC_URL'); ?>/logout.php" title="Sign out">Sign out</a>
    </body>
</html>