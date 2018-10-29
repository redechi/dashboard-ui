import request from 'superagent';

const cache = require('./cache');

const clientId = '385be37e93925c8fa7c7';
const scopes = [
  'scope:trip',
  'scope:location',
  'scope:vehicle:profile',
  'scope:vehicle:events',
  'scope:user:profile',
  'scope:automatic',
  'scope:behavior'
];
const isStaging = window.location.search.indexOf('staging') !== -1;
const apiUrl = isStaging ? 'https://accounts-stage.automatic.co' : 'https://accounts.automatic.com';
let accessToken = cache.getItem('accessToken');

exports.apiUrl = apiUrl;

exports.isLoggedIn = function isLoggedIn() {
  return !!accessToken;
};

exports.getAccessToken = function getAccessToken() {
  return accessToken;
};

exports.login = function login(username, password, staySignedIn, cb) {
  if (!username) {
    return cb(new Error('no_username'));
  }

  if (!password) {
    return cb(new Error('no_password'));
  }

  request
    .post(`${apiUrl}/oauth/access_token/`)
    .send(`username=${encodeURIComponent(username)}`)
    .send(`password=${encodeURIComponent(password)}`)
    .send(`client_id=${clientId}`)
    .send('grant_type=password')
    .send(`scope=${encodeURIComponent(scopes.join(' '))}`)
    .end((e, { body = {} }) => {
      if (e) {
        return cb((body.error && body.detail) ? body : e);
      } else if (!body.access_token) {
        return cb(new Error('no_access_token'));
      }

      accessToken = body.access_token;

      cache.setItem('accessToken', accessToken, staySignedIn);

      return cb();
    });
};

exports.logout = function logout() {
  accessToken = undefined;
  cache.clear();
};

exports.reset = function reset(username, cb) {
  request
    .post(`${apiUrl}/password/reset_email/`)
    .send(`email=${encodeURIComponent(username)}`)
    .end((e, response) => {
      if (e) {
        cb(e);
      } else if (!response.body) {
        cb(new Error('Unknown Error'));
      } else if (response.body.error) {
        cb(new Error(response.body.error));
      } else {
        cb();
      }
    });
};
