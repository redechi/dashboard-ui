'use strict';

var shareAPIUrl = 'https://automatic-share.herokuapp.com';

//Polyfill for window.location.origin in IE
if (!window.location.origin) {
  window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

function showLoading() {
  $('.loading').fadeIn();
}


function hideLoading() {
  $('.loading').fadeOut('fast');
}


function getCookie(key) {
  return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
}


function setCookie(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
  if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
  var sExpires = '';
  if (vEnd) {
    switch (vEnd.constructor) {
      case Number:
        sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
        break;
      case String:
        sExpires = '; expires=' + vEnd;
        break;
      case Date:
        sExpires = '; expires=' + vEnd.toUTCString();
        break;
    }
  }
  document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
  return true;
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
    hideLoading();
    cb(prepareDemoTrips(results));
  });
}


function fetchDemoVehicles(cb) {
  $.getJSON('/data/vehicles.json', cb);
}


function getAccessToken() {
  var queryParams = getQueryParams(document.location.search);
  var accessTokenFromSession = sessionStorage.getItem('accessToken');
  var accessTokenFromCookie = getCookie('accessToken');
  return queryParams.accessToken || accessTokenFromSession || accessTokenFromCookie;
}


function redirectToLogin() {
  window.location = $('.login-link').attr('href');
}


function fetchAllTrips(cb, progressCb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();
  var ts = sessionStorage.getItem('labs_ts');
  var trips = [];
  var oneHourAgo = Date.now() - (60*60*1000);

  if(queryParams.demo) {
    $('.loading').show();
    return fetchDemoTrips(cb);
  }
  if(!accessToken) {
    redirectToLogin();
    return;
  }

  function handleTripResults(results) {
    if(results && results.results) {
      trips = trips.concat(results.results);

      if(results._metadata.next) {
        var count = (results && results._metadata && results._metadata.count) ? results._metadata.count : '';
        progressCb(trips.length + ' of ' + count + ' trips');
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
  var accessToken = getAccessToken();

  if(queryParams.demo) {
    return fetchDemoTrips(function(trips) {
      cb({results: trips});
    });
  }

  if(!accessToken) {
    redirectToLogin();
    return;
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


function fetchVehicles(cb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();
  var ts = sessionStorage.getItem('labs_vehicles_ts');
  var oneHourAgo = Date.now() - (60*60*1000);

  if(queryParams.demo) {
    return fetchDemoVehicles(cb);
  }
  if(!accessToken) {
    redirectToLogin();
    return;
  }

  if(!ts || ts < oneHourAgo) {
    $.ajax({
      url: 'https://api.automatic.com/vehicle/',
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      if(results && results.results) {
        cacheVehicles(results.results);
        cb(results.results);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      cb([]);
    });
  } else {
    cb(getCachedVehicles());
  }
}


function cacheVehicles(vehicles) {
  try {
    sessionStorage.setItem('labs_vehicles', JSON.stringify(vehicles));
    sessionStorage.setItem('labs_vehicles_ts', Date.now());
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


function getCachedVehicles() {
  return JSON.parse(sessionStorage.getItem('labs_vehicles') || '[]');
}

function fetchUser(cb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();

  if(queryParams.demo) {
    return cb({
      first_name: 'Demo',
      last_name: 'User'
    });
  }

  if(!accessToken) {
    redirectToLogin();
    return;
  }

  $.ajax({
    url: 'https://api.automatic.com/user/me/',
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(cb)
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
    cb({});
  });
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


function formatForDemo() {
  var queryParams = getQueryParams(document.location.search);
  if(queryParams.demo) {
    $('.automatic-labs').attr('href', '/?demo#/labs');
    $('.alert-demo').show();
    $('body').addClass('demo');
  }
}


function showLoginLink() {
  var accessToken = getAccessToken();
  if(accessToken) {
    $('.btn-logout').show();
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


function getStateName(stateAbbrev) {
  var stateCodes = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
  };

  return stateCodes[stateAbbrev];
}


function pluralize(word, count) {
  var result = word;

  if (count !== 1) {
    result += 's';
  }

  return result;
}


function generateSpinner() {
  return $('<div>')
    .addClass('spinner center')
    .append(_.range(12).map(function() {
      return $('<div>').addClass('spinner-blade');
    }));
}


function saveShareData(data, cb) {
  var accessToken = getAccessToken();

  $.ajax({
    method: 'POST',
    url: shareAPIUrl + '/create',
    data: JSON.stringify(data),
    dataType: 'json',
    headers: {
      Authorization: 'bearer ' + accessToken
    },
    contentType: 'application/json'
  }).done(function(result) {
    cb(null, result.key);
  })
  .fail(function() {
    cb(new Error('Unable to create share'));
  });
}


function getShareData(slug, cb) {
  $.getJSON(shareAPIUrl + '/' + slug).done(function(result) {
    cb(null, result);
  }).fail(function() {
    cb(new Error('Unable to fetch shared data'));
  });
}


function formatEmailShare(subject, body, shareURL) {
  body += ' ' + shareURL;
  return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}


function formatTwitterShare(text, shareURL) {
  text += ' ' + shareURL;
  return 'https://twitter.com/intent/tweet?&text=' + encodeURIComponent(text) + '&tw_p=tweetbutton&via=automatic';
}


function formatFacebookShare(shareURL) {
  return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareURL);
}


/* On all pages */
formatForDemo();
showLoginLink();
