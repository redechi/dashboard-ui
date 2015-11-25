import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

const login = require('./login');

exports.getTrips = (cb) => {
  if(login.isLoggedIn()) {
    cb();
  } else {
    // Demo Trips
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

        return cb(null, prepDemoTrips(response.body.results));
      });
  }
};

function prepDemoTrips(trips) {
  // Make all demo trips recent
  let offset = moment().diff(moment(_.first(trips).started_at));
  let dayOffset = moment.duration(Math.floor(moment.duration(offset).asDays()), 'days');

  return trips.map((trip) => {
    trip.started_at = moment(trip.started_at).add(dayOffset, 'days').toISOString();
    trip.ended_at = moment(trip.ended_at).add(dayOffset, 'days').toISOString();
    return trip;
  });
}
