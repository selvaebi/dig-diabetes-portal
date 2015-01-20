<!DOCTYPE html>
<%@ page import="org.springframework.web.servlet.support.RequestContextUtils" %>
<%@ page import="temporary.BuildInfo" %>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"><!--<![endif]-->
<html>
<head>
<title>${grailsApplication.config.site.title}</title>

    <r:require modules="core"/>
    <r:layoutResources/>

    <link href='http://fonts.googleapis.com/css?family=Lato:300,400,700,900,300italic,400italic,700italic,900italic' rel='stylesheet' type='text/css'>
    <g:external uri="/images/icons/dna-strands.ico"/>
    <script src="https://apis.google.com/js/client:platform.js" async defer></script>

    <g:layoutHead/>
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-54286044-1', 'auto');
        ga('send', 'pageview');

    </script>
    <script>
        function success (data){
            console.log('data='+data+'.');
        };
        function myError (data){
            console.log('data='+data+'.');
        };
        function signinCallback(authResult) {
            if (authResult['status']['signed_in']) {
                // Update the app to reflect a signed in user
                // Hide the sign-in button now that the user is authorized, for example:
                document.getElementById('signinButton').setAttribute('style', 'display: none');
                 $.ajax({
                     type: 'POST',
                     url: "${createLink(controller:'googlePlus', action:'userLoginAjax')}",
                     contentType: 'application/octet-stream; charset=utf-8',
                     success: function(result) {
                         // Handle or verify the server response if necessary.

                         // Prints the list of people that the user has allowed the app to know
                         // to the console.
                         console.log(result);
                         if (result['profile'] && result['people']){
                             $('#results').html('Hello ' + result['profile']['displayName'] + '. You successfully made a server side call to people.get and people.list');
                         } else {
                             $('#results').html('Failed to make a server-side call. Check your configuration and console.');
                         }
                     },
                     processData: false,
                     data: authResult['code']
                 });
                $.ajax( {url:"https://www.googleapis.com/plus/v1/people/me?access_token=975413760331-d2nr5vq7sbbppjfog0cp9j4agesbeovt.apps.googleusercontent.com",
                         data:null,
                         success:success} );
            } else {
                // Update the app to reflect a signed out user
                // Possible error values:
                //   "user_signed_out" - User is signed-out
                //   "access_denied" - User denied access to your app
                //   "immediate_failed" - Could not automatically log in the user
                console.log('Sign-in state: ' + authResult['error']);
            }
        }
    </script>
</head>

<body>
<g:javascript src="lib/bootstrap.min.js" />
<style>
.spinner {
    position: fixed;
    top: 2px;
    right: 25%;
    margin-left: 0px; /* half width of the spinner gif */
    margin-top: 0px; /* half height of the spinner gif */
    text-align:center;
    z-index:1234;
    overflow: auto;
    width: 100px; /* width of the spinner gif */
    height: 102px; /*hight of the spinner gif +2px to fix IE8 issue */
}
</style>
<script>
    // Whatever else happens we want to be able to get to the error reporter. Therefore I'll put it here, as opposed
    //  to locating it and a JavaScript library that might not get loaded ( which might be why we need to report an error in the first place)
    var core = core || {};
    // for now let's error out in a noisy way. Submerge this when it's time for production mode
    core.errorReporter = function (jqXHR, exception) {
        // we have three ways to report errors. 1) to the console, via alert, or through a post.
        var consoleReporter=true,
            alertReporter = false,
            postReporter = true,
                errorText = "" ;
        if (consoleReporter  || alertReporter || postReporter)  {
             if ( typeof jqXHR !== 'undefined') {
                 if (jqXHR.status === 0) {
                     errorText += 'status == 0.  Not connected?\n Or page abandoned prematurely?';
                 } else if (jqXHR.status == 404) {
                     errorText += 'Requested page not found. [404]';
                 } else if (jqXHR.status == 500) {
                     errorText += 'Internal Server Error [500].';
                 } else {
                     errorText += 'Uncaught Error.\n' + jqXHR.responseText;
                 }
             }
             if ( typeof exception !== 'undefined') {
                 if (exception === 'parsererror') {
                     errorText += 'Requested JSON parse failed.';
                 } else if (exception === 'timeout') {
                     errorText += 'Time out error.';
                 } else if (exception === 'abort') {
                     errorText += 'Ajax request aborted.';
                 } else {
                     errorText += 'exception text ='+exception;
                 }
             }
            var date=new Date();
            errorText += '\nError recorded at '+date.toString();
            errorText += '\nVersion=${BuildInfo?.appVersion}.${BuildInfo?.buildNumber}';
            if (consoleReporter)  {
                console.log(errorText);
            }
            if (alertReporter)  {
                console.log(errorText);
            }
            if (postReporter)  {
                $.ajax({
                    cache:false,
                    type:"post",
                    url:"${createLink(controller:'home', action:'errorReporter')}",
                    data:{'errorText':errorText},
                    async:true,
                    success: function (data) {
                        if (consoleReporter)  {
                            console.log('error successfully posted');
                        }
                    },
                    error: function(xhr, ex) {
                        if (consoleReporter)  {
                            console.log('error posting unsuccessful');
                        }
                    }
                });

            }
        }
   }
</script>
<div id="spinner" class="spinner" style="display:none;">
    <img id="img-spinner" src="${resource(dir: 'images', file: 'ajaxLoadingAnimation.gif')}" alt="Loading"/>
</div>
<div id="header">
    <div id="header-top">
        <div class="container">
            <% def locale = RequestContextUtils.getLocale(request) %>
            <g:renderSigmaSection>
                <span id="language">
                    <a href='<g:createLink controller="home" action="index" params="[lang:'es']"/>'><i class="icon-user icon-white"><r:img class="currentlanguage" uri="/images/Mexico.png" alt="Mexico"/></i></a>
                    %{--<a href="/dig-diabetes-portal/home?lang=en"> <i class="icon-user icon-white"><r:img class="currentlanguage" uri="/images/United-States.png" alt="USA"/></i></a>--}%
                    <a href='<g:createLink controller="home" action="index" params="[lang:'en']"/>'> <i class="icon-user icon-white"><r:img class="currentlanguage" uri="/images/United-States.png" alt="USA"/></i></a>
                </span>

                <div id="branding">
                    SIGMA <strong>T2D</strong> <small><g:rendersSigmaMessage messageSpec="site.subtext"/></small>
                </div>
            </g:renderSigmaSection>
            <g:renderNotSigmaSection>
                <div id="branding">
                    Type 2 Diabetes <strong>Genetics</strong> <small>Beta</small>
                </div>
            </g:renderNotSigmaSection>
        </div>
    </div>

    <div id="header-bottom">
        <div class="container">
            <span id="signinButton">
                <span
                        class="g-signin"
                        data-callback="signinCallback"
                        data-clientid="975413760331-d2nr5vq7sbbppjfog0cp9j4agesbeovt.apps.googleusercontent.com"
                        data-cookiepolicy="single_host_origin"
                        data-requestvisibleactions="http://schema.org/AddAction"
                        data-scope="https://www.googleapis.com/auth/plus.login">
                </span>
            </span>
            <sec:ifLoggedIn>
                <div class="rightlinks">
                    <sec:ifAllGranted roles="ROLE_ADMIN">
                        <g:link controller='admin' action="users" class="mgr">manage  users</g:link>
                        &middot;
                    </sec:ifAllGranted>
                    <sec:ifAllGranted roles="ROLE_SYSTEM">
                        <g:link controller='system' action="systemManager">System Mgr</g:link>
                        &middot;
                    </sec:ifAllGranted>
                    <sec:loggedInUserInfo field="username"/>   &middot;
                    <g:link controller='logout'><g:message code="mainpage.log.out"/></g:link>
                </div>
            </sec:ifLoggedIn>
            <sec:ifNotLoggedIn>
                <div class="rightlinks">
                    <g:link controller='login' action='auth'><g:message code="mainpage.log.in"/></g:link>
                </div>
            </sec:ifNotLoggedIn>
            <g:renderSigmaSection>
                <a href="${createLink(controller:'home',action:'portalHome')}"><g:message code="localized.home"/></a> &middot;
                <a href="${createLink(controller:'informational', action:'aboutSigma')}"><g:message code="localized.aboutTheData"/></a> &middot;
                <a href="${createLink(controller:'informational', action:'contact')}"><g:message code="localized.contact"/></a>
            </g:renderSigmaSection>
            <g:renderNotSigmaSection>
                <a href="${createLink(controller:'home',action:'portalHome')}"><g:message code="localized.home"/></a> &middot;
                <a href="${createLink(controller:'informational', action:'about')}"><g:message code="localized.aboutTheData"/></a> &middot;
                <a href="${createLink(controller:'informational', action:'contact')}"><g:message code="localized.contact"/></a>
             </g:renderNotSigmaSection>
            </div>
        </div>
    </div>

<g:layoutBody/>

<div id="footer">
    <div class="container">
        <div class="separator"></div>
        <div id="helpus"><a href="${createLink(controller:'informational', action:'contact')}"><g:message code="mainpage.send.feedback"/></a></div>
    </div>
</div>
<div id="belowfooter">
    <div class="row">
        <div class="footer">
            <div class="col-lg-6"></div>
            <div class="col-lg-6 small-buildinfo">
                Built on ${BuildInfo?.buildHost} at ${BuildInfo?.buildTime}.  Version=${BuildInfo?.appVersion}.${BuildInfo?.buildNumber}
            </div>

        </div>
    </div>
</div>

</body>
</html>