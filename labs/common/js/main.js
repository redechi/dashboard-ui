function showLoading() {
  $('.loading').fadeIn();
}


function hideLoading() {
  $('.loading').fadeOut('fast');
}


function fetchTrips(cb) {
  function fetchTripsPage(url) {
    $.ajax({
      url: url,
      headers: {
        Authorization: 'bearer ' + sessionStorage.getItem('accessToken')
      }
    })
    .done(function(results) {
      if(results && results.results) {
        trips = trips.concat(results.results);

        if(results._metadata.next) {
          fetchTripsPage(results._metadata.next);
        } else {
          cacheTrips(trips);
          hideLoading();
          cb(trips);
        }
      }
    });
  }

  var ts = localStorage.getItem('ts');
  var trips = [];
  if(ts < Date.now() - (60*60*1000)) {
    showLoading();
    fetchTripsPage('https://api.automatic.com/trip/?limit=250&page=1');
  } else {
    trips = getCachedTrips();
    cb(trips);
  }
}


function cacheTrips(trips) {
  var order = _.pluck(trips, 'id');
  localStorage.setItem('order', JSON.stringify(order));
  localStorage.setItem('ts', Date.now());

  trips.forEach(function(trip) {
    cacheTrip(trip);
  });
}


function cacheTrip(trip) {
  localStorage.setItem(trip.id, JSON.stringify(trip));
}


function cacheVehicles(vehicles) {
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
}


function getCachedTrips(trip_id) {
  if(trip_id) {
    // get specific cached trip
    return JSON.parse(localStorage.getItem(trip_id) || '{}');
  } else {
    // get all cached trips
    var order = JSON.parse(localStorage.getItem('order') || '[]');
    return order.map(function(trip_id) { return JSON.parse(localStorage.getItem(trip_id) || {}); });
  }
}


function metersToMiles(m) {
  // converts meters to miles
  return m / 1609.34;
}


function litersToGallons(l) {
  return l * 0.264172;
}


function formatNumber(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
