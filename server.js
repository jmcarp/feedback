var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var GitHubApi = require('github');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, {token: accessToken, refreshToken: refreshToken, profile: profile});
    }
  )
);

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({secret: 'calici'}));
app.use('/static', express.static(__dirname + '/static'));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: process.env.FEEDBACK_ORIGIN,
    credentials: true
  })
);

app.get('/', function(req, res) {
  res.send(
    req.isAuthenticated() ?
      req.user.profile :
      {}
  );
});

app.get('/auth', passport.authenticate('github', {scope: 'repo'}), function(req, res) {});

app.get('/auth/callback', passport.authenticate('github'), function(req, res) {
  res.redirect('/static/post-login.html');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.send({});
});

app.post('/issue', function(req, res) {
  var github = new GitHubApi({version: '3.0.0'});
  github.authenticate({
    type: 'oauth',
    token: req.isAuthenticated() ?
      req.user.token :
      process.env.FEEDBACK_TOKEN
  });
  github.issues.create(
    {
      user: process.env.FEEDBACK_USER,
      repo: process.env.FEEDBACK_REPO,
      title: req.body.title,
      body: req.body.body
    },
    function(err, resp) {
      if (err) {
        res.status(err.code).send({message: err.message});
      } else {
        res.send(resp);
      }
    }
  );
});

app.listen(process.env.PORT || 3000);
