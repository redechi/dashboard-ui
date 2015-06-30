function showLoading() {
  $('.loading').fadeIn();
}


function hideLoading() {
  $('.loading').fadeOut('fast');
}


function getAccessToken() {
  var query = getQueryParams(document.location.search);
  return query.accessToken || getCookie('token');
}


function fetchTrips(cb) {
  var accessToken = getAccessToken();
  var ts = sessionStorage.getItem('labs_ts');
  var trips = [];
  var oneHourAgo = Date.now() - (60*60*1000);

  if(!accessToken) {
    alert('To access Automatic Labs, please log in first.');
    window.location = '/';
  }

  function fetchTripsPage(url) {
    $.ajax({
      url: url,
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      if(results && results.results) {
        trips = trips.concat(results.results);

        var count = (results && results._metadata && results._metadata.count) ? results._metadata.count : '';

        $('.loading .text').text('Loaded ' + trips.length + ' of ' + count);

        if(results._metadata.next) {
          fetchTripsPage(results._metadata.next);
        } else {
          returnTrips();
        }
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      returnTrips();
    });
  }

  function returnTrips() {
    cacheTrips(trips);
    hideLoading();
    cb(trips);
  }

  if(!ts || ts < oneHourAgo) {
    showLoading();
    fetchTripsPage('https://api.automatic.com/trip/?limit=250&page=1');
  } else {
    trips = getCachedTrips();
    cb(trips);
  }
}


function cacheTrips(trips) {
  var order = _.pluck(trips, 'id');
  sessionStorage.setItem('labs_order', JSON.stringify(order));
  sessionStorage.setItem('labs_ts', Date.now());

  trips.forEach(function(trip) {
    cacheTrip(trip);
  });
}


function cacheTrip(trip) {
  sessionStorage.setItem('labs_' + trip.id, JSON.stringify(trip));
}


function cacheVehicles(vehicles) {
  sessionStorage.setItem('labs_vehicles', JSON.stringify(vehicles));
}


function getCachedTrips(trip_id) {
  if(trip_id) {
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
  qs = qs.split('+').join(' ');

  var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

  while((tokens = re.exec(qs)) !== null) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}


function getCookie(key) {
  return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
}
