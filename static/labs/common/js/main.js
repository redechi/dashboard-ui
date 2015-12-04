'use strict';

function showLoading() {
  $('.loading').fadeIn();
}


function hideLoading() {
  $('.loading').fadeOut('fast');
}


function makeTripsRecent(trips) {
  var firstTrip = trips[0];
  var offset = moment().diff(moment(firstTrip.started_at));
  var dayOffset = moment.duration(Math.floor(moment.duration(offset).asDays()), 'days');

  return trips.map(function(trip) {
    trip.started_at = moment(trip.started_at).add(dayOffset, 'days');
    trip.ended_at = moment(trip.ended_at).add(dayOffset, 'days');
    return trip;
  });
}


function prepareDemoTrips(response) {
  return makeTripsRecent(response.results.map(function(trip) {
    trip.average_kmpl = (trip.distance_m / 1000) / trip.fuel_volume_l;
    return trip;
  }));
}


function fetchDemoTrips(cb) {
  $.getJSON('/data/trips.json', function(results) {
    returnTrips(prepareDemoTrips(results), cb);
  });
}


function fetchAllTrips(cb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = queryParams.accessToken || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  var ts = sessionStorage.getItem('labs_ts');
  var trips = [];
  var oneHourAgo = Date.now() - (60*60*1000);

  if(queryParams.demo) {
    return fetchDemoTrips(cb);
  }

  if(!accessToken) {
    return promptForLogin();
  }

  function handleTripResults(results) {
    if(results && results.results) {
      trips = trips.concat(results.results);

      var count = (results && results._metadata && results._metadata.count) ? results._metadata.count : '';

      $('.loading .title').text('Loading...');
      $('.loading .text').text(trips.length + ' of ' + count + ' trips');

      if(results._metadata.next) {
        fetchTripsPage(results._metadata.next, handleTripResults, handleTripError);
      } else {
        returnTrips(trips, cb);
      }
    }
  }

  function handleTripError(jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
    returnTrips(trips, cb);
  }

  if(!ts || ts < oneHourAgo) {
    showLoading();
    fetchTripsPage('https://api.automatic.com/trip/?limit=250&page=1', handleTripResults, handleTripError);
  } else {
    trips = getCachedTrips();
    cb(trips);
  }
}


function fetchTripsPage(url, cb, errCb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = queryParams.accessToken || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

  if(queryParams.demo) {
    return fetchDemoTrips(function(trips) {
      cb({results: trips});
    });
  }

  if(!accessToken) {
    promptForLogin();
  }

  $.ajax({
    url: url,
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(cb)
  .fail(errCb);
}


function returnTrips(trips, cb) {
  cacheTrips(trips);
  hideLoading();
  cb(trips);
}


function promptForLogin() {
  alert('To access Automatic Labs, please log in first.');
  window.location = '/';
}


function cacheTrips(trips) {
  var order = _.pluck(trips, 'id');
  try {
    sessionStorage.setItem('labs_order', JSON.stringify(order));
    sessionStorage.setItem('labs_ts', Date.now());
  } catch(e) {
    sessionStorage.clear();
  }

  trips.forEach(function(trip) {
    cacheTrip(trip);
  });
}


function cacheTrip(trip) {
  try {
    sessionStorage.setItem('labs_' + trip.id, JSON.stringify(_.omit(trip, 'vehicle_events')));
  } catch(e) {
    sessionStorage.clear();
  }
}


function cacheVehicles(vehicles) {
  try {
    sessionStorage.setItem('labs_vehicles', JSON.stringify(vehicles));
  } catch(e) {
    sessionStorage.clear();
  }
}


function getCachedTrips(trip_id) {
  if (trip_id) {
    // get specific cached trip
    return JSON.parse(sessionStorage.getItem('labs_' + trip_id) || '{}');
  } else {
    // get all cached trips
    var order = JSON.parse(sessionStorage.getItem('labs_order') || '[]');
    return order.map(function(trip_id) { return JSON.parse(sessionStorage.getItem('labs_' + trip_id) || {}); });
  }
}


function metersToMiles(m) {
  // converts meters to miles
  return m / 1609.34;
}


function litersToGallons(l) {
  return l * 0.264172;
}


function kmplToMpg(kmpl) {
  return kmpl * 2.35214583;
}


function formatNumber(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}


function formatDate(time, timezone) {
  try {
    return moment(time).tz(timezone).format('MMM D, YYYY');
  } catch(e) {
    return moment(time).format('MMM D, YYYY');
  }
}


function formatTime(time, timezone) {
  try {
    return moment(time).tz(timezone).format('h:mm A');
  } catch(e) {
    return moment(time).format('h:mm A');
  }
}


function formatDayOfWeek(time, timezone) {
  try {
    return moment(time).tz(timezone).format('dddd');
  } catch(e) {
    return moment(time).format('dddd');
  }
}


function formatDuration(s) {
  var duration = moment.duration(s, 'seconds'),
      hours = (duration.asHours() >= 1) ? Math.floor(duration.asHours()) + ' h ' : '',
      minutes = duration.minutes() + ' min';
  return hours + minutes;
}


function formatAddress(address) {
  if(!address) {
    address = {};
  }

  address.cleaned = (address && address.name) ? address.name.replace(/\d+, USA/gi, '') : 'Unknown Address';

  return address;
}


function getQueryParams(qs) {
  var params = {};
  var parts = qs.substring(1).split('&');
  for (var i = 0; i < parts.length; i++) {
    var nv = parts[i].split('=');
    if (!nv[0]) {
      continue;
    }
    params[nv[0]] = nv[1] || true;
  }
  return params;
}


function makeLinksDemo() {
  var queryParams = getQueryParams(document.location.search);
  if(queryParams.demo) {
    $('.automatic-labs').attr('href', '/?demo#/labs');
  }
}


function calculateDistanceMi(lat1, lon1, lat2, lon2) {
  function toRadians(degree) {
    return (degree * (Math.PI / 180));
  }
  var radius = 3959.0; //Earth Radius in mi
  var radianLat1 = toRadians(lat1);
  var radianLon1 = toRadians(lon1);
  var radianLat2 = toRadians(lat2);
  var radianLon2 = toRadians(lon2);
  var radianDistanceLat = radianLat1 - radianLat2;
  var radianDistanceLon = radianLon1 - radianLon2;
  var sinLat = Math.sin(radianDistanceLat / 2.0);
  var sinLon = Math.sin(radianDistanceLon / 2.0);
  var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2.0);
  var d = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return d;
}


function pluralize(word, count) {
  var result = word;

  if (count !== 1) {
    result += 's';
  }

  return result;
}


/* On all pages */
makeLinksDemo();
