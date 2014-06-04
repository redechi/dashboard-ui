var express = require('express');
var session = require('cookie-session');
var serveStatic = require('serve-static');
var request = require('request');
var nconf = require('nconf');
var dataExport = require('./dataexport.js');
var debug = require('debug')('AutomaticWebApp');


nconf.env().argv();
nconf.file('./config.json');

nconf.set('AUTOMATIC_SCOPES', 'scope:trip:summary scope:location scope:vehicle scope:notification:hard_accel scope:notification:hard_brake scope:notification:speeding');

var app = express();

app.use(session({secret: 'odgYU39hXezdjEJJTUWd6YB'}));
app.set('views', 'dist');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


if(app.get('env') === 'development') {
  // Don't serve cache in development
  app.get('/manifest.appcache', function(req, res) {
    res.send(404);
  });

  app.use(serveStatic(__dirname));

  //Allow specifying token in development
  app.all('*', function(req, res, next) {
    setAccessToken(req, res, process.argv[2]);
    next();
  });
}


if(app.get('env') === 'production') {
  //force https in production
  app.all('*', function(req, res, next) {
    if(req.headers['x-forwarded-proto'] != 'https') {
      res.redirect('https://' + req.headers.host + req.path);
    } else {
      next();
    }
  });

  app.use(serveStatic('dist'));
}


app.get('/redirect/', function(req, res) {
  if(req.query.code) {
    request.post({
      uri: nconf.get('AUTOMATIC_AUTH_TOKEN_URL'),
      form: {
        client_id: nconf.get('AUTOMATIC_CLIENT_ID'),
        client_secret: nconf.get('AUTOMATIC_CLIENT_SECRET'),
        code: req.query.code,
        grant_type: 'authorization_code'
      }
    }, function(e, r, body) {
      try {
        var access_token = JSON.parse(body || '{}');
        setAccessToken(req, res, access_token.access_token);
        res.redirect('/');
      } catch(e) {
        console.log(e);
        res.json({error: 'No access token'});
      }
    });
  } else {
    res.redirect('/');
  }
});


app.get('/authorize/', function(req, res) {
  res.redirect(nconf.get('AUTOMATIC_AUTHORIZE_URL') + '?client_id=' + nconf.get('AUTOMATIC_CLIENT_ID') + '&response_type=code&scope=' + nconf.get('AUTOMATIC_SCOPES'))
});


app.get('/logout/', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});


app.get('/download/trips.csv', dataExport);


//require user to login for all routes below
app.get('*', function(req, res, next) {
  if(req.session && req.session.access_token) {
    next();
  } else {
    res.redirect('/authorize/');
  }
});


app.get('/', function(req, res) {
  res.json('thanks');
});


app.get('/app', function(req, res) {
  res.render('app.html', {access_token: req.session.access_token});
});


/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.render('error.html', {
      message: err.message,
      error: err
    });
  });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.render('error.html', {
    message: err.message,
    error: {}
  });
});


// not found
app.all('*', function(req, res, next){
  res.status(404);
  res.render('error.html', {
    message: '',
    error: 'Not Found'
  });
});


function setAccessToken(req, res, access_token) {
  if(access_token) {
    req.session.access_token = access_token;
  }
}


var server = app.listen(process.env.PORT || 3000, function() {
  debug('Express server listening on port ' + server.address().port);
});
