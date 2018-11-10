/* eslint no-var:0, func-names:0, no-unused-vars:0, vars-on-top: 0 */
/* eslint object-shorthand: 0, prefer-template: 0, prefer-arrow-callback: 0 */
/* global _, $, moment */

'use strict';

var shareAPIUrl = 'https://automatic-share.herokuapp.com';

/**
 * Polyfill for window.location.origin in IE
 */
if (!window.location.origin) {
  var port = window.location.port ? ':' + window.location.port : '';
  window.location.origin = window.location.protocol + '//' + window.location.hostname + port;
}

/**
 * Show loading div
 */
function showLoading() {
  $('.loading').fadeIn();
}

/**
 * Hide loading div
 */
function hideLoading() {
  $('.loading').fadeOut('fast');
}

/**
 * Get a cookie
 * @param {string} key - the key of the cookie to get
 * @return {string} decoded cookie value
 */
function getCookie(key) {
  /* jscs: disable */
  /* eslint-disable */
  return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  /* jscs: enable */
  /* eslint-enable */
}

/**
 * Set a cookie
 * @param {string} sKey - key of the cookie to set
 * @param {string} sValue - value of the cookie to set
 * @param {date} vEnd - expiration date
 * @param {string} sPath - path
 * @param {string} sDomain - domain
 * @param {boolean} bSecure - whether or not the cookie is secure
 * @return {boolean} success or failure
 */
function setCookie(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
  /* jscs: disable */
  /* eslint-disable */
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
  /* jscs: enable */
  /* eslint-enable */
}

/**
 * Decode query params from a query string
 * @param {string} qs - an encoded querystring
 * @return {object} decoded query params
 */
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

/**
 * Shift the dates on an array of trips so that the most recent trip happened
 * yesterday, keeping the same time between all trips
 * @param {array} trips - an array of trips
 * @return {array} an array of trips with dates shifted
 */
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

/**
 * Format demo trips so they look like real trips
 * @param {array} trips - an array of demo trips
 * @return {array} an array of trips with formatted properly
 */
function prepareDemoTrips(response) {
  return makeTripsRecent(response.results.map(function(trip) {
    trip.average_kmpl = (trip.distance_m / 1000) / trip.fuel_volume_l;
    return trip;
  }));
}

/**
 * Fetch demo trips from static json
 * @param {function} cb - callback when trips are fetched
 */
function fetchDemoTrips(cb) {
  $.getJSON('/data/trips.json', function(results) {
    hideLoading();
    cb(prepareDemoTrips(results));
  });
}

/**
 * Get the access token of the logged in user
 * @return {string} access token
 */
function getAccessToken() {
  var queryParams = getQueryParams(document.location.search);
  var accessTokenFromSession = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  var accessTokenFromCookie = getCookie('accessToken');
  return queryParams.accessToken || accessTokenFromSession || accessTokenFromCookie;
}

/**
 * Redirect the browser to the login page
 */
function redirectToLogin() {
  window.location = $('.login-link').attr('href') || '../login/index.html';
}

/**
 * Cache the users vehicles in session storage
 * @param {array} vehicles - an array of vehicles to cache
 */
function cacheVehicles(vehicles) {
  try {
    sessionStorage.setItem('labs_vehicles', JSON.stringify(vehicles));
    sessionStorage.setItem('labs_vehicles_ts', Date.now());
  } catch (e) {
    sessionStorage.clear();
  }
}

/**
 * Cache a trip in session storage
 * @param {object} trip - a trip to cache
 */
function cacheTrip(trip) {
  try {
    sessionStorage.setItem('labs_' + trip.id, JSON.stringify(_.omit(trip, 'vehicle_events')));
  } catch (e) {
    sessionStorage.clear();
  }
}

/**
 * Cache a users trips in session storage
 * @param {array} trips - an array of trips to cache
 */
function cacheTrips(trips) {
  var order = _.pluck(trips, 'id');
  try {
    sessionStorage.setItem('labs_order', JSON.stringify(order));
    sessionStorage.setItem('labs_ts', Date.now());
  } catch (e) {
    sessionStorage.clear();
  }

  trips.forEach(function(trip) {
    cacheTrip(trip);
  });
}

/**
 * Get cached trips from session storage
 * @param {string} tripId (optional) - the id of the trip to fetch
 * @return {object or array} an array of trips or single trip object
 */
function getCachedTrips(tripId) {
  if (tripId) {
    // get specific cached trip
    return JSON.parse(sessionStorage.getItem('labs_' + tripId) || '{}');
  }

  // get all cached trips
  var order = JSON.parse(sessionStorage.getItem('labs_order') || '[]');
  return order.map(function(id) { return JSON.parse(sessionStorage.getItem('labs_' + id) || {}); });
}

/**
 * Get cached vehicles from session storage
 * @return {array} an array of vehicles
 */
function getCachedVehicles() {
  return JSON.parse(sessionStorage.getItem('labs_vehicles') || '[]');
}

/**
 * Handler for when trips are ready
 * @param {array} trips - an array of trips
 * @param {function} cb - callback
 */
function returnTrips(trips, cb) {
  cacheTrips(trips);
  hideLoading();
  cb(trips);
}

/**
 * Fetch one page of trips
 * @param {string} url - an API url to request
 * @param {function} cb - callback for successful fetch
 * @param {function} errCb - a callback for if there is an error
 */
function fetchTripsPage(url, cb, errCb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();

  if (queryParams.demo) {
    return fetchDemoTrips(function(trips) {
      cb({ results: trips });
    });
  }

  if (!accessToken) {
    redirectToLogin();
    return false;
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

/**
 * Fetch all trips
 * @param {function} cb - callback for successful fetch
 * @param {function} progress - a callback to be called after each page request
 * with the status of the fetching process
 */
function fetchAllTrips(cb, progressCb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();
  var ts = sessionStorage.getItem('labs_ts');
  var trips = [];
  var oneHourAgo = Date.now() - (60 * 60 * 1000);

  if (queryParams.demo) {
    $('.loading').show();
    return fetchDemoTrips(cb);
  }

  if (!accessToken) {
    redirectToLogin();
    return false;
  }

  function handleTripError(jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
    returnTrips(trips, cb);
  }

  function handleTripResults(results) {
    if (results && results.results) {
      trips = trips.concat(results.results);

      if (results._metadata.next) {
        var count = (results && results._metadata && results._metadata.count) ? results._metadata.count : '';
        progressCb(trips.length + ' of ' + count + ' trips');
        fetchTripsPage(results._metadata.next, handleTripResults, handleTripError);
      } else {
        returnTrips(trips, cb);
      }
    }
  }

  if (!ts || ts < oneHourAgo) {
    showLoading();
    fetchTripsPage('https://api.automatic.com/trip/?limit=250&started_at__lte=' + Date.now() + '&started_at__gte=1325376000000', handleTripResults, handleTripError);
  } else {
    trips = getCachedTrips();
    cb(trips);
  }
}

/**
 * Fetch all vehicles
 * @param {function} cb - callback for successful fetch
 */
function fetchVehicles(cb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();
  var ts = sessionStorage.getItem('labs_vehicles_ts');
  var oneHourAgo = Date.now() - (60 * 60 * 1000);

  if (queryParams.demo) {
    return $.getJSON('/data/vehicles.json', function(results) {
      cb(results.results);
    });
  }

  if (!accessToken) {
    redirectToLogin();
    return false;
  }

  if (!ts || ts < oneHourAgo) {
    $.ajax({
      url: 'https://api.automatic.com/vehicle/',
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      if (results && results.results) {
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

/**
 * Fetch user information
 * @param {function} cb - callback for successful fetch
 */
function fetchUser(cb) {
  var queryParams = getQueryParams(document.location.search);
  var accessToken = getAccessToken();

  if (queryParams.demo) {
    return cb({
      first_name: 'Demo',
      last_name: 'User'
    });
  }

  if (!accessToken) {
    redirectToLogin();
    return false;
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

/**
 * Convert meters to miles
 * @param {float} m - meters
 * @return {float} miles
 */
function metersToMiles(m) {
  // converts meters to miles
  return m / 1609.34;
}

/**
 * Convert liters to gallons
 * @param {number} l - liters
 * @return {number} gallons
 */
function litersToGallons(l) {
  return l * 0.264172;
}

/**
 * Convert kmpl to mpg
 * @param {number} kmpl - km per liter
 * @return {number} mpg
 */
function kmplToMpg(kmpl) {
  return kmpl * 2.35214583;
}

/**
 * Format a number with thousands commas
 * @param {number} x - number to format
 * @return {number} formatted number
 */
function formatNumber(x) {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Format a date with a timezaone
 * @param {string or number} time - epoch time or ISO 8601 time
 * @param {string} timezone - Timezone, like "America/Los_Angeles"
 * @return {string} formatted date
 */
function formatDate(time, timezone) {
  try {
    return moment(time).tz(timezone).format('MMM D, YYYY');
  } catch (e) {
    return moment(time).format('MMM D, YYYY');
  }
}

/**
 * Format a time with a timezaone
 * @param {string or number} time - epoch time or ISO 8601 time
 * @param {string} timezone - Timezone, like "America/Los_Angeles"
 * @return {string} formatted time
 */
function formatTime(time, timezone) {
  try {
    return moment(time).tz(timezone).format('h:mm A');
  } catch (e) {
    return moment(time).format('h:mm A');
  }
}

/**
 * Get day of the week from a date with a timezaone
 * @param {string or number} time - epoch time or ISO 8601 time
 * @param {string} timezone - Timezone, like "America/Los_Angeles"
 * @return {string} Day of the week like "friday"
 */
function formatDayOfWeek(time, timezone) {
  try {
    return moment(time).tz(timezone).format('dddd');
  } catch (e) {
    return moment(time).format('dddd');
  }
}

/**
 * Format a duration into hours and minutes
 * @param {number} seconds - duration in seconds
 * @return {string} Formatted duration like "1 h 32 min"
 */
function formatDuration(s) {
  var duration = moment.duration(s, 'seconds');
  var hours = (duration.asHours() >= 1) ? Math.floor(duration.asHours()) + ' h ' : '';
  var minutes = duration.minutes() + ' min';
  return hours + minutes;
}

/**
 * Format an address
 * @param {object} address - an address from an Automatic trip
 * @return {string} Formatted address
 */
function formatAddress(address) {
  if (!address) {
    address = {};
  }

  address.cleaned = (address && address.name) ? address.name.replace(/\d+, USA/gi, '') : 'Unknown Address';

  return address;
}

/**
 * Format a labs page for demo mode
 */
function formatForDemo() {
  var queryParams = getQueryParams(document.location.search);
  if (queryParams.demo) {
    $('.automatic-labs').attr('href', '/?demo#/labs');
    $('.alert-demo').show();
    $('body').addClass('demo');
  }
}

/**
 * Show the logout link on a demo page if a user is logged in
 * @param {string} labName - slug of lab to link to
 */
function showLoginLink(labName) {
  $('.login-link').attr('href', '../login/index.html?lab=' + labName);

  var accessToken = getAccessToken();
  if (accessToken) {
    $('.btn-logout').show();
  }
}

/**
 * Calculate the distance in miles between two coordinates
 * @param {number} lat1 - latitude 1
 * @param {number} lon1 - longitude 1
 * @param {number} lat2 - latitude 2
 * @param {number} lng2 - longitude 2
 * @return {number} distance in miles between the two coordinates
 */
function calculateDistanceMi(lat1, lon1, lat2, lon2) {
  function toRadians(degree) {
    return (degree * (Math.PI / 180));
  }

  var radius = 3959.0; // Earth Radius in mi
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

/**
 * Get the full state name from abbreviation
 * @param {string} stateAbbrev - state Abbreviation
 * @return {string} Full name of state, if found
 */
function getStateName(stateAbbrev) {
  var stateCodes = {
    AL: 'Alabama',
    AK: 'Alaska',
    AS: 'American Samoa',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District Of Columbia',
    FM: 'Federated States Of Micronesia',
    FL: 'Florida',
    GA: 'Georgia',
    GU: 'Guam',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MH: 'Marshall Islands',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    MP: 'Northern Mariana Islands',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PW: 'Palau',
    PA: 'Pennsylvania',
    PR: 'Puerto Rico',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VI: 'Virgin Islands',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming'
  };

  return stateCodes[stateAbbrev];
}

/**
 * Pluralize a word based on count
 * @param {string} word - word to pluralize
 * @param {integer} count - count of things
 * @return {string} pluralized word
 */
function pluralize(word, count) {
  var result = word;

  if (count !== 1) {
    result += 's';
  }

  return result;
}

/**
 * Create a div with spinner classes
 * @return {div} jquery object containing classed divs
 */
function generateSpinner() {
  return $('<div>')
    .addClass('spinner center')
    .append(_.range(12).map(function() {
      return $('<div>').addClass('spinner-blade');
    }));
}

/**
 * Save share data to share server. User must be logged in
 * @param {object} data - object of data to share
 * @param {function} cb - callback for when data is shared
 */
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

/**
 * Get share data from share server
 * @param {string} slug - slug of data to retreive
 * @param {function} cb - callback for when data is retreived
 */
function getShareData(slug, cb) {
  $.getJSON(shareAPIUrl + '/' + slug).done(function(result) {
    cb(null, result);
  }).fail(function() {
    cb(new Error('Unable to fetch shared data'));
  });
}

/**
 * Format a mailto link
 * @param {string} subject - subject line of email
 * @param {string} body - body of email
 * @param {string} shareURL - URL to be shared
 * @return {string} formatted mailto link
 */
function formatEmailShare(subject, body, shareURL) {
  body += ' ' + shareURL;
  return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

/**
 * Format a twitter share intent URL
 * @param {string} text - text to tweet
 * @param {string} shareURL - URL to be shared
 * @return {string} formatted twitter share intent URL
 */
function formatTwitterShare(text, shareURL) {
  text += ' ' + shareURL;
  return 'https://twitter.com/intent/tweet?&text=' + encodeURIComponent(text) + '&tw_p=tweetbutton&via=automatic';
}

/**
 * Format a facebook share URL
 * @param {string} shareURL - URL to be shared
 * @return {string} formatted facebook share URL
 */
function formatFacebookShare(shareURL) {
  return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareURL);
}
