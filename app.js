var config = require('./config');

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser')
var session = require('express-session')
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

var port = process.env.PORT || config.PORT;

var app = express();
//############################### Auth0 Init() ###########################
const strategy = new Auth0Strategy({
      domain: config.AUTH0.domain ,
      clientID: config.AUTH0.client_id,
      clientSecret: config.AUTH0.client_secret,
      callbackURL: config.AUTH0.callback_url
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
        return done(null, profile);
    }
);

const env = {
    AUTH0_CLIENT_ID: config.AUTH0.client_id,
    AUTH0_DOMAIN: config.AUTH0.domain,
    AUTH0_CALLBACK_URL: config.AUTH0.callback_url
};

passport.use(strategy);
passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(user, done) { done(null, user); });

//Middle wares
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session(
    {
        secret: 'supernova', 
        saveUninitialized: true, 
        resave: true, 
        cookie : { 
            secure : false, 
            maxAge : (4 * 60 * 60 * 1000) 
        } 
    }
));

app.use(passport.initialize());
app.use(passport.session());

var ensureLoggedIn =  passport.authenticate('auth0', {
    clientID: env.AUTH0_CLIENT_ID,
    domain: env.AUTH0_DOMAIN,
    redirectUri: env.AUTH0_CALLBACK_URL,
    audience: 'https://' + env.AUTH0_DOMAIN + '/userinfo',
    responseType: 'code',
    scope: 'openid profile email'
   
});
//##########################################################################
  

//Controllers
var loginCtrl = require('./controllers/loginController');
var adminCtrl = require('./controllers/adminController');
var scoreCtrl = require('./controllers/scoreController');
var testCtrl  = require('./controllers/testController');
var errorCtrl  = require('./controllers/404Controller');

//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


//Set static path :: used by .css 
app.use('/static', express.static(path.join(__dirname, 'public')))

// Routes
app.get('/test', testCtrl.get_callback ); // Routes :: Candidate Test
app.post('/test', testCtrl.post_callback );

app.get('/score', scoreCtrl.get_callback); // Routes :: Candidate Score

app.get('/admin', adminCtrl.get_callback); // Routes :: Admin Dashboard
app.post('/admin', adminCtrl.post_callback);

app.get('/404', errorCtrl.get_callback);


//################################# Login Auth0 #################################
app.get( '/google-login',ensureLoggedIn);

app.get( '/login',loginCtrl.get_callback);

app.get('/login/:invite',loginCtrl.get_callback);

app.get('/google/auth/callback', passport.authenticate('auth0',{ failureRedirect: '/' } ), (req, res, next) =>{
    if (!req.user) {
        throw new Error('user null');
    }
    res.redirect('/login')
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('/', (req, res) => { res.redirect('/login'); }); 

app.get('/:any', (req, res) => { res.redirect('/404'); }); 

//#######################################################################


app.listen(port,function(){
    console.log("Server started on port "+port);
})
