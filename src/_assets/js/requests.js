import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

const login = require('./login');

exports.getData = (cb) => {
  if(login.isLoggedIn()) {
    //TODO: get logged in data
    cb();
  } else {
    // Demo Trips
    fetchDemoData('/data/trips.json', (e, trips) => {
      if(e) return cb(e);

      fetchDemoData('/data/vehicles.json', (e, vehicles) => {
        if(e) return cb(e);

        cb(null, prepDemoTrips(trips), _.sortBy(vehicles, 'make'));
      });
    });
  }
};

function fetchDemoData(fileName, cb) {
  request
    .get(fileName)
    .set('Accept', 'application/json')
    .end(function(e, response){
      if(e) {
        return cb(e);
      }
      if(!response.body || !response.body.results) {
        return cb(new Error('No results returned'));
      }

      return cb(null, response.body.results);
    });
}

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
