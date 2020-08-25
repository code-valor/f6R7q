const express  = require('express');
const session  = require('express-session');
const passport = require('passport');
const Strategy = require('passport-discord').Strategy;
const app = express();
const fs = require('fs');
const ejs = require('ejs');

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];
var prompt = 'consent'

passport.use(new Strategy({
    clientID: '747845646257619017',
    clientSecret: process.env.clientSecret,
    callbackURL: 'https://discordgiris.herokuapp.com/callback',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.engine(".ejs", ejs.__express);
app.set('views',__dirname+'/web');
app.use(express.static('web'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/') } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/', checkAuth, function(req, res) {
    console.log(req.user)
    var profileImage = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=128`;
    res.render('./index.ejs', {
        discordRequest: req,
        pp: profileImage
    });
});


function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.render('./notloggedin.ejs');
}

let port = process.env.PORT || 5000;


app.listen(port, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:' + port)
})
