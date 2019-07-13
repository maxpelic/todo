<!DOCTYPE html>
<html>
    <head>
        <title>Login | Title Pending</title>
        <script src="https://apis.google.com/js/platform.js" async defer></script>
        <meta name="google-signin-client_id" content="<?php echo getenv('GOOGLE_LOGIN_CLIENT_ID'); ?>">
        <script>
            let $statusElement;
            const update_status = (message, statusType)=>{
                $statusElement = $statusElement || query('.status');
                $statusElement.textContent = message;
                $statusElement.className = 'status ' + statusType;                
            }, query = s=>document.querySelector(s);
            var onGoogleSignIn = googleUser=>{
                const id_token = googleUser.getAuthResponse().id_token, login_request = new XMLHttpRequest();
                login_request.open('POST', "<?php echo getenv('DYNAMIC_URL'); ?>/loginWithGoogle.php", true);
                login_request.onloadend = r=>{
                    if(login_request.status !== 200)
                        return update_status('Whoops, Google Sign-in failed', 'bad');
                    update_status('Signed in with Google, redirecting', 'good');
                };
                login_request.send('id_token='+encodeURIComponent(id_token));                
            };         
        </script>
    </head>
    <body>
        <span class="status"></span>
        <div class="g-signin2" data-onsuccess="onGoogleSignIn"></div>
    </body>
</html>