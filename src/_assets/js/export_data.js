import moment from 'moment';
import filesaverjs from 'filesaverjs';

const formatters = require('./formatters');

const csvFieldNames = [
  'Vehicle',
  'Start Location Name',
  'Start Time',
  'End Location Name',
  'End Time',
  'Distance (mi)',
  'Duration (min)',
  'Fuel Cost (USD)',
  'Average MPG',
  'Fuel Volume (gal)',
  'Hard Accelerations',
  'Hard Brakes',
  'Duration Over 70 mph (secs)',
  'Duration Over 75 mph (secs)',
  'Duration Over 80 mph (secs)',
  'Start Location Lat',
  'Start Location Lon',
  'Start Location Accuracy (meters)',
  'End Location Lat',
  'End Location Lon',
  'End Location Accuracy (meters)',
  'Path',
  'Tags'
];

exports.trips = (selectedTrips, cb) => {
  if(!exportIsSupported()) {
    cb(new Error('not_supported'));
  }

  //Safari does not support filesaver, so use URL
  if(isSafari()) {
    let blobUrl = "data:application/x-download;charset=utf-8," + encodeURIComponent(this.tripsToCSV(selectedTrips));
    //TODO: show download export overlay
  } else {
    let blob = new Blob([tripsToCSV(selectedTrips)], {type: "text/csv;charset=utf-8"});

    setTimeout(function() {
      let filename = `automatic-trips-${moment().format('YYYY-MM-DD')}.csv`;
      //fix for firefox on callback - needs a timeout
      filesaverjs.saveAs(blob, filename);
      cb();
    }.bind(this), 500);
  }
};

function exportIsSupported() {
  //check for export support
  let exportSupported = false;
  try {
    exportSupported = !!new Blob;
  } catch (e) {}

  return exportSupported;
}

function isSafari() {
  return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
}

function tripsToCSV(trips) {
  let tripsArray = trips.map(tripToArray);
  tripsArray.unshift(csvFieldNames);

  return tripsArray.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function csvEscape(item) {
  let escapedItem;
  if (item && item.indexOf && (item.indexOf(',') !== -1 || item.indexOf('"') !== -1)) {
    escapedItem = `"${item.replace(/"/g, '""')}"`;
  } else {
    escapedItem = `"${item}"`;
  }
  return escapedItem;
}

function tripToArray(trip) {
  return [
    trip.vehicle,
    trip.start_address ? trip.start_address.name : '',
    formatters.formatTime(trip.started_at, trip.start_time_zone, 'YYYY-MM-DD h:mm A'),
    trip.end_address ? trip.end_address.name : '',
    formatters.formatTime(trip.ended_at, trip.end_time_zone, 'YYYY-MM-DD h:mm A'),
    trip.distance_miles.toFixed(2) || 0,
    moment.duration('seconds', trip.duration_s).asMinutes().toFixed(2) || 0,
    trip.fuel_cost_usd,
    trip.average_mpg.toFixed(2) || 0,
    trip.fuel_volume_gal.toFixed(2) || 0,
    trip.hard_accels,
    trip.hard_brakes,
    trip.duration_over_70_s,
    trip.duration_over_75_s,
    trip.duration_over_80_s,
    trip.start_location.lat,
    trip.start_location.lon,
    trip.start_location.accuracy_m,
    trip.end_location.lat,
    trip.end_location.lon,
    trip.end_location.accuracy_m,
    trip.path,
    trip.tags.join(',')
  ];
}
