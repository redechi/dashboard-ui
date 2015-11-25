var request = require('superagent');
var login = require('./login');

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
