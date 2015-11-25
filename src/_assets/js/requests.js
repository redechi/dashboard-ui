import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

const login = require('./login');

exports.getTrips = (cb) => {
  if(login.isLoggedIn()) {
    cb();
  } else {
    request
      .get('/data/trips.json')
      .set('Accept', 'application/json')
      .end(function(e, response){
        if(e) {
          return cb(e);
        }
        if(!response.body || !response.body.results) {
          return cb(new Error('No trip results returned'));
        }

        return cb(null, response.body.results);
      });
  }
};
