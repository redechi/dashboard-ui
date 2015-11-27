import moment from 'moment';


exports.address = (address) => {
  let formattedAddress = '';

  if(address.street_number) {
    formattedAddress += address.street_number + ' ';
  }
  if(address.street_name) {
    formattedAddress += address.street_name + ', ';
  }
  if(address.city) {
    formattedAddress += address.city;
  }
  if(address.city && address.state) {
    formattedAddress += ', ';
  }
  if(address.state) {
    formattedAddress += address.state;
  }

  return formattedAddress || address.display_name || 'Unknown Address';
};

exports.formatTrip = (trip) => {
  trip.selected = false;
  trip.distance_miles = exports.metersToMiles(trip.distance_m);
  trip.fuel_volume_gal = exports.litersToGal(trip.fuel_volume_l);
  trip.average_mpg = exports.kmplToMpg(trip.average_kmpl);
  return trip;
};

exports.distance = (distanceMiles) => {
  if (Math.round(distanceMiles) >= 100) {
    return distanceMiles.toFixed();
  } else {
    return distanceMiles ? distanceMiles.toFixed(1) : '';
  }
};

exports.formatTime = (time, timezone, format) => {
  try {
    return moment(time).tz(timezone).format(format);
  } catch(e) {
    return moment(time).format(format);
  }
};

exports.duration = (seconds) => (seconds >= 60 * 60) ? exports.durationHours(seconds) : exports.durationMinutes(seconds);

exports.durationHours = (seconds) => {
  let duration = moment.duration(seconds, 'seconds');
  let hours = Math.floor(duration.asHours());
  let minutes = moment(duration.minutes(), 'm').format('mm');
  return `${hours}:${minutes}`;
};

exports.durationMinutes = (seconds) => {
  let minutes = moment.duration(seconds, 'seconds').asMinutes();
  if (Math.round(minutes) >= 100) {
    return minutes.toFixed();
  } else {
    return (minutes || 0).toFixed(1);
  }
}

exports.cost = (fuelCost) => (fuelCost || 0).toFixed(2);

exports.costWithUnit = (fuelCost) => '$' + ((fuelCost) ? fuelCost : 0).toFixed(2);

exports.averageMPG = (mpg) => mpg ? mpg.toFixed(1) : 0;

exports.score = (score) => Math.round(score) || undefined;

exports.metersToMiles = (m) => m / 1609.34;

exports.litersToGal = (liters) => liters * 0.264172;

exports.kmplToMpg = (kmpl) => kmpl * 2.35214583;

exports.formatVehicle = (vehicle) => vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';

exports.dateRange = (range) => moment(range[0]).format('MMM D - ') + moment(range[1]).format('MMM D, YYYY');

exports.scoreColor = (score) => {
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
