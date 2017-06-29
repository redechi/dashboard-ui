/* eslint no-shadow: 0 */

import request from 'superagent';
import _ from 'lodash';
import moment from 'moment';

const cache = require('./cache');
const login = require('./login');

const isStaging = window.location.search.indexOf('staging') !== -1;
const apiUrl = isStaging ? 'https://api.automatic.co' : 'https://api.automatic.com';

function fetchDemoData(fileName, cb) {
  request
    .get(fileName)
    .set('Accept', 'application/json')
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      if (!response.body || !response.body.results) {
        return cb(new Error('No results returned'));
      }

      return cb(null, response.body.results);
    });
}

function prepDemoTrips(trips) {
  // Make all demo trips recent
  const offset = moment().diff(moment(_.first(trips).started_at));
  const dayOffset = moment.duration(Math.floor(moment.duration(offset).asDays()), 'days');

  return trips.map((trip) => {
    trip.started_at = moment(trip.started_at).add(dayOffset, 'days').toISOString();
    trip.ended_at = moment(trip.ended_at).add(dayOffset, 'days').toISOString();
    trip.average_kmpl = (trip.distance_m / 1000) / trip.fuel_volume_l;
    return trip;
  });
}

function fetchData(endpoint, query, loadingProgress, cb) {
  let results = [];

  function makeRequest(endpoint, query, cb) {
    request
      .get(`${apiUrl}/${endpoint}`)
      .query({ ...query })
      .set('Authorization', `bearer ${login.getAccessToken()}`)
      .end((e, response) => {
        if (e) {
          // if unauthorized clear cache of tokens and force reload
          if (response.statusCode === 401) {
            cache.clear();
            location.reload();
          }

          return cb(e);
        }

        if (!response.body || !response.body.results) {
          return cb(new Error('No results returned'));
        }

        results = results.concat(response.body.results);

        if (response.body._metadata.next) {
          if (loadingProgress) {
            loadingProgress(results.length, response.body._metadata.count);
          }

          if (query.page) {
            query.page += 1;
          } else {
            query.page = 2;
          }

          makeRequest(endpoint, query, cb);
        } else {
          cb(null, results);
        }
      });
  }

  makeRequest(endpoint, query, cb);
}

function appendVehicleNickNames(vehicles, cb) {
  let completedRequests = 0;
  const totalVehicles = vehicles.length
  if (totalVehicles === 0) {
    cb(null, vehicles);
  }

  for (let vehicle of vehicles) {
    request
      .get(`${apiUrl}/vehicles/${vehicle.id}/settings/`)
      .set('Authorization', `bearer ${login.getAccessToken()}`)
      .end((e, response) => {
        if (e) {
          // if unauthorized clear cache of tokens and force reload
          if (response.statusCode === 401) {
            cache.clear();
            location.reload();
          }

          // Ignore 403s as non mustang vehicles 403 on this route
          if (response.statusCode !== 403) {
            return cb(e);
          }
        }
        // if response fails nickname should just be undefined
        vehicle.nickname = response.body.nickname;
        completedRequests++;
        // No Promises :(
        if (completedRequests === totalVehicles) {
          cb(null, vehicles);
        }
      });
  }
}

exports.userHasNoTrips = (cb) => {
  request
    .get(`${apiUrl}/trip/`)
    .query({ limit: 1 })
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      if (!response.body || !response.body.results) {
        return cb(new Error('No results returned'));
      }

      cb(null, !response.body.results.length);
    });
};

exports.getTrips = (startDate, endDate, loadingProgress, cb) => {
  if (login.isLoggedIn()) {
    fetchData('vehicle/', {}, null, (e, vehicles) => {
      if (e) {
        return cb(e);
      }
      appendVehicleNickNames(vehicles, (e, vehiclesWithNickname) => {
        if (e) return cb(e);

        if (isStaging) {
          fetchData('trip/', {
            started_at__gte: (startDate / 1000),
            started_at__lte: (endDate / 1000),
            limit: 250
          }, loadingProgress, (e, trips) => {
            if (e) {
              return cb(e);
            }

            cb(null, trips, _.sortBy(vehicles, 'make'));
          });
        } else {
          request
          .get(`${apiUrl}/all-trips/`)
          .set('Authorization', `bearer ${login.getAccessToken()}`)
          .end((e, resp) => {
            if (e) {
              return cb(e);
            }
            const redirectUrl = JSON.parse(resp.text).url
            request
            .get(redirectUrl)
            .end((e, tripResponse) => {
              const trips = JSON.parse(tripResponse.text).results
              const startDateS = startDate / 1000
              const endDateS = endDate / 1000
              const filteredTrips = _.filter(trips, (trip) => {
                return (moment(trip.started_at).unix() >= startDateS && moment(trip.started_at).unix() <= endDateS)
              })
              cb(null, filteredTrips, _.sortBy(vehicles, 'make'));
            })
          });
        }
      });
    });
  } else {
    // Demo Trips
    fetchDemoData('/data/vehicles.json', (e, vehicles) => {
      if (e) {
        return cb(e);
      }

      fetchDemoData('/data/trips.json', (e, trips) => {
        if (e) {
          return cb(e);
        }

        cb(null, prepDemoTrips(trips), _.sortBy(vehicles, 'make'));
      });
    });
  }
};

exports.getApps = (cb) => {
  request
    .get(`${apiUrl}/v1/access_token`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      if (!response.body) {
        return cb(new Error('No results returned'));
      }

      return cb(null, response.body);
    });
};

exports.disconnectApp = (appId, cb) => {
  request
    .del(`${apiUrl}/v1/access_token/${appId}`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end(cb);
};

exports.getUser = (cb) => {
  request
    .get(`${apiUrl}/user/me/`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      return cb(null, response.body);
    });
};

// Trip Tagging
exports.setTripTag = (tripId, cb) => {
  const tag = { tag: 'business' };

  if (!login.isLoggedIn()) {
    return cb(null);
  }

  request
    .post(`${apiUrl}/trip/${tripId}/tag/`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(tag))
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      if (!response.body) {
        return cb(new Error('No results returned'));
      }

      return cb(null, response.body);
    });
};

exports.deleteTripTag = (tripId, cb) => {
  if (!login.isLoggedIn()) {
    return cb(null);
  }

  request
    .delete(`${apiUrl}/trip/${tripId}/tag/business/`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end((e, response) => {
      if (e) {
        return cb(e);
      }

      if (response.statusCode === 204) {
        return cb(null, true);
      }

      return cb(new Error('Unconfirmed delete'));
    });
};

exports.getTripTag = (tripId, cb) => {
  request
    .get(`${apiUrl}/trip/${tripId}/tag/business/`)
    .set('Authorization', `bearer ${login.getAccessToken()}`)
    .end((e, response) => {
      if (e) {
        if (response && response.statusCode === 404) {
          return cb(null, null);
        }

        return cb(e);
      }

      if (!response.body) {
        return cb(new Error('No results returned'));
      }

      return cb(null, response.body);
    });
};
