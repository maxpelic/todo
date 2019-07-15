/* eslint-env es6 */
/* global window,document,gapi,HTMLElement,Event,XMLHttpRequest */
let googleLoadEvent = new Event('googleLoad');
// eslint-disable-next-line
function loadGoogle(){
    gapi.load('auth2', function() {
        gapi.auth2.init();
        window.dispatchEvent(googleLoadEvent);
    });
}
(()=>{
    /** tools to make my life easier **/
    const query = q=>document.querySelector(q), dynamicUrl = query('meta[name=dynamicUrl]').getAttribute('content');
    HTMLElement.prototype.c = function(f){
        this.addEventListener('click', f);
    };
    /** ajax requests **/
    function ajaxRequest(url){
        this.request = new XMLHttpRequest();
        this.url = url;
        return this;
    }
    ajaxRequest.prototype.post = function(data){
        this.request.open('POST', this.url, true);
        this.request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.request.send(data);
        return this;
    };
    ajaxRequest.prototype.get = function(){
        this.request.open('GET', this.url, true);
        this.request.send();
        return this;
    };
    ajaxRequest.prototype.then = function(f){
        this.request.onloadend = function(){f.apply(this, [this.response, this.status])};
    };
    
    /** sign in/out **/
    (()=>{
        const logUserOut = ()=>{
            let completed = 0;
            const redirect = ()=>{
                if(++completed < 2) return;
                window.location.href='/login.php';
            }, logOutGoogle = ()=>{
                const instance = gapi.auth2.getAuthInstance();
                if(instance.isSignedIn.Ab) instance.signOut().then(redirect);
                else redirect();
            };
            new ajaxRequest(dynamicUrl + '/logout.php').get().then((r, s)=>{
                if(s === 200){
                    //logged out
                    redirect();
                } else {
                    //delete cookie and redirect
                    document.cookie = 'heyo=null; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                    redirect();
                }
            });

            //google log out
            if(window.gapi && gapi.auth2) logOutGoogle();
            else window.addEventListener('googleLoad', logOutGoogle);
        };
        query('#logoutLink').c(e=>{
            logUserOut();
            e.preventDefault();
            return false;
        });
        //if user is not logged in, redirect to login page
        new ajaxRequest(dynamicUrl + '/getLoginStatus.php').get().then((r, s)=>{
            if(s === 401){
                //to prevent an endless loop, log out of google if user login is not found
                logUserOut();
            }
        });
    })();
    
})();
