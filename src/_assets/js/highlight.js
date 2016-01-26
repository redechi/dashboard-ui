const graph = require('./graph');
const map = require('./map');

let highlightedTrips = [];

exports.highlightTrips = function highlightTrips(trips, zoomTrip) {
  map.highlightTrips(trips, zoomTrip);
  graph.highlightTrips(trips);
  trips.forEach(trip => {
    document.getElementById(trip.id).classList.add('highlighted');
  });
  highlightedTrips = highlightedTrips.concat(trips);
};

exports.unhighlightTrips = function unhighlightTrips(zoomTrip) {
  map.unhighlightTrips(highlightedTrips, zoomTrip);
  graph.unhighlightTrips(highlightedTrips);
  highlightedTrips.forEach(trip => {
    document.getElementById(trip.id).classList.remove('highlighted');
  });
  highlightedTrips = [];
};

exports.getHighlightedTrips = function getHighlightedTrips() {
  return highlightedTrips;
};
