import _ from 'lodash';
import moment from 'moment';
import polyline from 'polyline';

const mapHelpers = require('./map_helpers');

function metersToMiles(m) {
  return m / 1609.34;
}

function litersToGal(liters) {
  return liters * 0.264172;
}

function kmplToMpg(kmpl) {
  return kmpl * 2.35214583;
}

exports.formatVehicle = vehicle => vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';

exports.dateRange = range => moment(range[0]).format('MMM D - ') + moment(range[1]).format('MMM D, YYYY');

exports.scoreColor = score => {
  if (score < 20) {
    return 'rgb(252, 59, 47)';
  } else if (score < 40) {
    return 'rgb(253, 104, 43)';
  } else if (score < 60) {
    return 'rgb(253, 148, 38)';
  } else if (score < 80) {
    return 'rgb(254, 204, 47)';
  } else if (score < 90) {
    return 'rgb(183, 205, 55)';
  } else if (score < 100) {
    return 'rgb(148, 206, 59)';
  } else if (score === 100) {
    return 'rgb(112, 206, 63)';
  }
};

function formatVehicleEvents(events, tripPath) {
  let decodedPath;
  let cumulativeDistances;

  // Only decode path if needed, once per trip
  if (_.some(events, item => item.type === 'speeding') && tripPath) {
    decodedPath = polyline.decode(tripPath);
    cumulativeDistances = mapHelpers.getCumulativeDistance(decodedPath);
  }

  return events.map(item => {
    if (item.type === 'speeding' && tripPath) {
      const start = metersToMiles(item.start_distance_m);
      const end = metersToMiles(item.end_distance_m);
      item.path = mapHelpers.subPath(start, end, decodedPath, cumulativeDistances);
    }

    return item;
  });
}

function formatAddress(address) {
  if (!address) {
    address = {};
  }

  if (!address.display_name) {
    address.display_name = 'Unknown Address';
  }

  return address;
}

exports.formatTrip = (trip, vehicles) => {
  const vehicle = _.findWhere(vehicles, { url: trip.vehicle });
  return {
    id: trip.id,
    vehicle: {
      display_name: exports.formatVehicle(vehicle),
      id: vehicle ? vehicle.id : null
    },
    started_at: trip.started_at,
    ended_at: trip.ended_at,
    start_address: formatAddress(trip.start_address),
    end_address: formatAddress(trip.end_address),
    start_location: trip.start_location,
    end_location: trip.end_location,
    start_time_zone: trip.start_time_zone,
    end_time_zone: trip.end_time_zone,
    path: trip.path,
    duration_s: trip.duration_s,
    distance_miles: metersToMiles(trip.distance_m),
    fuel_volume_gal: litersToGal(trip.fuel_volume_l),
    fuel_cost_usd: trip.fuel_cost_usd,
    average_mpg: kmplToMpg(trip.average_kmpl),
    hard_accels: trip.hard_accels,
    hard_brakes: trip.hard_brakes,
    duration_over_70_s: trip.duration_over_70_s,
    duration_over_75_s: trip.duration_over_75_s,
    duration_over_80_s: trip.duration_over_80_s,
    score_events: trip.score_events,
    score_speeding: trip.score_speeding,
    vehicle_events: formatVehicleEvents(trip.vehicle_events, trip.path),
    tags: trip.tags
  };
};

exports.distance = (distanceMiles) => {
  if (Math.round(distanceMiles) >= 100) {
    return distanceMiles.toFixed();
  }

  return distanceMiles ? distanceMiles.toFixed(1) : 0;
};

exports.formatTime = (time, timezone, format) => {
  try {
    return moment(time).tz(timezone).format(format);
  } catch (e) {
    return moment(time).format(format);
  }
};

exports.duration = (seconds) =>
  (seconds >= 60 * 60) ? exports.durationHours(seconds) : exports.durationMinutes(seconds);

exports.durationHours = (seconds) => {
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = moment(duration.minutes(), 'm').format('mm');
  return `${hours}:${minutes}`;
};

exports.durationMinutes = (seconds) => {
  const minutes = moment.duration(seconds, 'seconds').asMinutes();
  if (Math.round(minutes) >= 100) {
    return minutes.toFixed();
  }

  return (minutes || 0).toFixed(1);
};

exports.cost = (fuelCost) => (fuelCost || 0).toFixed(2);

exports.costWithUnit = (fuelCost) => `$${(fuelCost || 0).toFixed(2)}`;

exports.averageMPG = (mpg) => mpg ? mpg.toFixed(1) : 0;

exports.score = (score) => Math.round(score) || 0;
