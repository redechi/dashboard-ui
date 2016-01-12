const graph = require('./graph');
const map = require('./map');

let highlightedTrips = [];

exports.highlightTrips = function(trips) {
  map.highlightTrips(trips);
  graph.highlightTrips(trips);
  trips.forEach(trip => {
    document.getElementById(trip.id).classList.add('highlighted');
  });
  highlightedTrips = highlightedTrips.concat(trips);
};

exports.unhighlightTrips = function() {
  map.unhighlightTrips(highlightedTrips);
  graph.unhighlightTrips(highlightedTrips);
  highlightedTrips.forEach(trip => {
    document.getElementById(trip.id).classList.remove('highlighted');
  });
  highlightedTrips = [];
};
