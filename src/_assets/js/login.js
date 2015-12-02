import request from 'superagent';

const cache = require('./cache');


const clientId = '385be37e93925c8fa7c7'
let accessToken = cache.getItem('accessToken');

exports.isLoggedIn = function() {
  return !!accessToken;
};

exports.accessToken = function() {
  return accessToken;
};

exports.login = function(username, password, cb) {
  if(!username) {
    return cb(new Error('no_username'));
  }

  if(!password) {
    return cb(new Error('no_password'));
  }

  request
    .post('https://accounts.automatic.com/oauth/access_token/')
    .send(`username=${username}`)
    .send(`password=${password}`)
    .send(`client_id=${clientId}`)
    .send('grant_type=password')
    .send('scope=scope:trip scope:location scope:vehicle:profile scope:vehicle:events scope:user:profile scope:automatic scope:behavior')
    .end(function(e, response){
      if(e && response.body && response.body.error) {
        e.message = response.body.error
        return cb(e);
      } else if(!response || !response.body.access_token) {
        return cb(new Error('no_access_token'));
      } else if(e) {
        return cb(e);
      }

      accessToken = response.body.access_token;

      cache.setItem('accessToken', accessToken);

      return cb();
    });
};
