const _ = require('lodash');

const graph = require('./graph');
const map = require('./map');

let selectedTrips = [];

function setSelectAllText() {
  if (exports.areAllSelected()) {
    document.getElementById('selectionControl').innerText = 'Deselect all';
  } else {
    document.getElementById('selectionControl').innerText = 'Select all';
  }
}

exports.selectTrips = function selectTrips(trips) {
  map.selectTrips(trips);
  graph.selectTrips(trips);
  trips.forEach(trip => {
    const tripDiv = document.getElementById(trip.id);
    if (tripDiv) {
      tripDiv.classList.add('selected');
      tripDiv.getElementsByClassName('trip-select')[0].checked = true;
    }
  });
  selectedTrips = selectedTrips.concat(trips);
  setSelectAllText();
};

exports.deselectTrips = function deselectTrips(trips) {
  map.deselectTrips(trips);
  graph.deselectTrips(trips);
  trips.forEach(trip => {
    const tripDiv = document.getElementById(trip.id);
    if (tripDiv) {
      tripDiv.classList.remove('selected');
      tripDiv.getElementsByClassName('trip-select')[0].checked = false;
    }
  });
  selectedTrips = _.difference(selectedTrips, trips);
  setSelectAllText();
};

exports.toggleSelect = function toggleSelect(trip) {
  if (_.findWhere(selectedTrips, { id: trip.id })) {
    exports.deselectTrips([trip]);
  } else {
    exports.selectTrips([trip]);
  }
};

exports.areAllSelected = function areAllSelected() {
  const boxes = [...document.querySelectorAll('.trip-select')];

  if (!boxes || !boxes.length) {
    return false;
  }

  return _.every(boxes, (box) => {
    return box.checked;
  });
};

exports.getSelected = function getSelected() {
  return [...document.querySelectorAll('.trips li.selected')].map(tripDiv => tripDiv.id);
};
