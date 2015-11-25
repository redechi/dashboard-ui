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

exports.durationMinutes = (seconds) => moment.duration(seconds, 'seconds').asMinutes().toFixed();

exports.cost = (fuelCost) => (fuelCost || 0).toFixed(2);

exports.costWithUnit = (fuelCost) => '$' + ((fuelCost) ? fuelCost : 0).toFixed(2);

exports.averageMPG = (mpg) => mpg ? mpg.toFixed(1) : 0;

exports.score = (score) => Math.round(score) || undefined;

exports.metersToMiles = (m) => m / 1609.34;

exports.litersToGal = (liters) => liters * 0.264172;

exports.kmplToMpg = (kmpl) => kmpl * 2.35214583;

exports.formatVehicle = (vehicle) => vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';
