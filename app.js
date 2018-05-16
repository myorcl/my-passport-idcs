//BEGIN: LOAD EXPRESS AND EJS
	var express = require('express');
	var app = express();
	app.set('view engine', 'ejs');
//END: LOAD EXPRESS AND EJS

//BEGIN: LOAD FILE SYSTEM (TO OPEN CERTIFICATES) AND HTTPS
	var fs = require('fs');
	var https = require('https');
	var server = https.createServer({
		cert: fs.readFileSync('myapp.crt'),
		key: fs.readFileSync('myapp.key')
	}, app);
//END: LOAD FILE SYSTEM (TO OPEN CERTIFICATES) AND HTTPS

//BEGIN: ALLOW STATIC FILES FROM public FOLDER
	app.use(express.static('public'));
//BEGIN: END: ALLOW STATIC FILES FROM public FOLDER

//BEGIN: LOAD PASSPORT DEPENDENCIES
	//body-parser: to read credentials from request body
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({ extended: false }));
	//cookie-parser: to support cookies and hold session in user's browser
	var cookieParser = require('cookie-parser');
	app.use(cookieParser());
	//express-session: to support sessions on server side
	var expressSession = require('express-session');
	app.use(expressSession({ secret: process.env.SESSION_SECRET || 'Welcome1', resave: false, saveUninitialized: false }));
//END: LOAD PASSPORT DEPENDENCIES

//BEGIN: LOAD PASSPORT ENGINE
	var passport = require('passport');
	app.use(passport.initialize());
	app.use(passport.session());
//END: LOAD PASSPORT ENGINE

//BEGIN: IDCS INFORMATION
    // Properties file with IDCS tenant info
    var myprops = JSON.parse(fs.readFileSync('idcs-tenant.json', 'utf8'));

    var idcsInfo = {
    discoveryURL: myprops.tenantURL + '/.well-known/idcs-configuration',
    clientID: myprops.clientID,
    clientSecret: myprops.clientSecret,
    // callbackURL: 'https://PassportIDCS-gse00014232.uscom-east-1.oraclecloud.com:443/auth/idcs/callback',
    callbackURL: myprops.appURL + '/auth/idcs/callback',
    profileURL: myprops.tenantURL + '/admin/v1/Me',
    passReqToCallback: true
  };

    console.log('idcsInfo.profileURL:[' + idcsInfo.profileURL + ']');
    console.log('idcsInfo.clientID:[' + idcsInfo.clientID + ']');
//    console.log('idcsInfo.clientSecret:[' + idcsInfo.clientSecret + ']');

//END: IDCS INFORMATION

//BEGIN: LOAD IDCS STRATEGY
	var OIDCSStrategy = require('passport-oauth-oidcs').Strategy;
	var oidcsstrgt = new OIDCSStrategy(idcsInfo,
		function(req, accessToken, refreshToken, profile, done) {
				req.session.idcsAccessToken = accessToken;
				return done(null, profile);
		}
	);
	passport.use('idcs', oidcsstrgt);
//END: LOAD IDCS STRATEGY

//BEGIN: USER SERIALIZATION (REQUIRED BY PASSPORTJS)
	passport.serializeUser(function(user, done) { done(null, user); });
	passport.deserializeUser(function(user, done) { done(null, user); });
//END: USER SERIALIZATION (REQUIRED BY PASSPORTJS)

//BEGIN: PASSPORT ENDPOINTS FOR AUTHENTICATION AND CALLBACK (LINKED TO IDCS STRATEGY)
	app.get('/auth/idcs', passport.authenticate('idcs'));
	app.get('/auth/idcs/callback', passport.authenticate('idcs', { successRedirect: '/', failureRedirect: '/' }));
//END: PASSPORT ENDPOINTS FOR AUTHENTICATION AND CALLBACK (LINKED TO IDCS STRATEGY)

//BEGIN: ENDPOINTS
	app.get('/', function(req, res) {

            var filter2 = JSON.stringify(req.user, ['Display Name', 'Email']);
            var filter3 = String(filter2).split(",");
            var filter = String(filter3[0]).split(":");
		res.render('home', {
			isAuthenticated: req.isAuthenticated(),
			myUserDetails: JSON.stringify(req.user),
			myUserSummary: filter[1],
			tenantURL: myprops.tenantURL
		});
	});

        app.get('/logout', function(req, res){
          req.session.destroy();
          req.logout();
          res.redirect(302, myprops.tenantURL + '/oauth2/v1/userlogout');
        });

//END: ENDPOINTS

//BEGIN: LOAD APP LISTENER
	// var port = process.env.PORT || 443;
	var port = process.env.PORT || 8943;
	if (port == 8080) {
	  // Oracle APAAS using HTTP:8080 with LBaaS HTTPS:443 termination
	  app.listen(port, function() {
		console.log('HTTP ready on ' + server.address().address + ':' + 			app.address().port);
	  });
	}
	else {
	  // Other deployments
	  server.listen(port, function() {
		console.log('HTTPS ready on ' + server.address().address + ':' + 			server.address().port);
	  });
	}
//END: LOAD APP LISTENER
