const graph = require('./graph');
const map = require('./map');

let highlightedTrips = [];

exports.highlightTrips = function highlightTrips(trips, zoomTrip) {
  map.highlightTrips(trips, zoomTrip);
  graph.highlightTrips(trips);
  trips.forEach(trip => {
    const tripDiv = document.getElementById(trip.id);
    if (tripDiv) {
      tripDiv.classList.add('highlighted');
    }
  });
  highlightedTrips = highlightedTrips.concat(trips);
};

exports.unhighlightTrips = function unhighlightTrips(zoomTrip) {
  map.unhighlightTrips(highlightedTrips, zoomTrip);
  graph.unhighlightTrips(highlightedTrips);
  highlightedTrips.forEach(trip => {
    const tripDiv = document.getElementById(trip.id);
    if (tripDiv) {
      tripDiv.classList.remove('highlighted');
    }
  });
  highlightedTrips = [];
};

exports.getHighlightedTrips = function getHighlightedTrips() {
  return highlightedTrips;
};
