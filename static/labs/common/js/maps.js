/* eslint no-var:0, func-names:0, no-unused-vars:0, vars-on-top:0 */
/* global L, _, $, polyline, simplify */

L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IkV6ZFdvQmsifQ.SDDOhAsgorCNf8T0ejWKmA';

function getSamplingTolerance(points) {
  var granularity = 200;
  var firstPoint = _.first(points);
  var lastPoint = _.last(points);
  var deltaX = firstPoint[0] - lastPoint[0];
  var deltaY = firstPoint[1] - lastPoint[1];
  var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  return distance / granularity;
}

function simplifyEncodedPolyline(encodedPolyline) {
  var points = polyline.decode(encodedPolyline);
  var latLonPoints = _.map(points, function(point) {
    return { x: point[0], y: point[1] };
  });

  var tolerance = getSamplingTolerance(points);
  var highQuality = false;
  var downSampledPoints = simplify(latLonPoints, tolerance, highQuality);
  downSampledPoints = _.map(downSampledPoints, function(point) {
    return [point.x, point.y];
  });

  return polyline.encode(downSampledPoints);
}

function constructMapboxStaticUrl(encodedPolylines, params) {
  var fullparams = _.defaults(params || {}, {
    format: 'png256',
    width: 720,
    height: 300
  });

  var formattedPolylines = _.map(encodedPolylines, function(pl) {
    return 'path(' + simplifyEncodedPolyline(pl) + ')';
  });

  var overlay = encodeURIComponent(formattedPolylines.join(','));
  var mapID = 'mapbox.streets';
  var url = mapID + '/' + overlay + '/auto/' + fullparams.width + 'x' + fullparams.height + '.' + fullparams.format;
  url = 'https://api.mapbox.com/v4/' + url + '/?access_token=' + encodeURIComponent(L.mapbox.accessToken);
  return url;
}

function getStaticMap(encodedPolylines, params) {
  if (_.isEmpty(encodedPolylines)) {
    return null;
  }

  /**
   * Iterate through the encodedPolylines, sorted by its length, and attempt to construct the
   * static map url. The final url will be the one fitting the largest number of polylines, while
   * still being under the maximum character limit of 4096
   */
  var memoPolylines = [];
  var MAPBOX_STATIC_URL_MAX_NUM_CHAR = 4096;
  var memoUrl = null;
  var sortedPolylines = (_.sortBy(encodedPolylines, function(pl) { return pl.length; })).reverse();
  _.each(sortedPolylines, function(pl) {
    var continueIteration = true;
    var newPolylines = [].concat(memoPolylines).concat(pl);
    var newUrl = constructMapboxStaticUrl(newPolylines, params);
    if (newUrl.length >= MAPBOX_STATIC_URL_MAX_NUM_CHAR) {
      continueIteration = false;
    } else {
      memoPolylines = newPolylines;
      memoUrl = newUrl;
    }

    return continueIteration;
  });

  return memoUrl;
}

function drawTripMap(trip, map) {
  var lineStyle = {
    color: '#b84329',
    opacity: 0.6, weight: 4
  };
  var markerStyle = {
    'marker-size': 'small',
    'marker-color': '#f78e13'
  };

  if (trip.path) {
    var points = polyline.decode(trip.path);
    var line = L.polyline(points, lineStyle);

    line.addTo(map);

    var bounds = L.latLngBounds(line.getBounds());
    map.fitBounds(bounds, { padding: [20, 20] });
  }

  var startAddress = trip.start_address ? trip.start_address.display_name : 'Unknown';
  var endAddress = trip.end_address ? trip.end_address.display_name : 'Unknown';

  L.marker([trip.start_location.lat, trip.start_location.lon], {
    icon: L.mapbox.marker.icon(markerStyle)
  }).bindPopup(startAddress).addTo(map);

  L.marker([trip.end_location.lat, trip.end_location.lon], {
    icon: L.mapbox.marker.icon(markerStyle)
  }).bindPopup(endAddress).addTo(map);

  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  map.scrollWheelZoom.disable();
}
