var moment = require('moment');
var formatters = require('./formatters');

exports.calculateTotals = function(trips) {
  if(!trips) {
    return false;
  }

  let totals = trips.reduce((memo, trip) => {
    memo.distance += trip.distance_miles;
    memo.duration += trip.duration_s;
    memo.fuel += trip.fuel_volume_gal;
    memo.cost += trip.fuel_cost_usd;
    memo.sumScoreEvents += trip.scoreEvents * trip.duration_s;
    memo.sumscoreSpeeding += trip.scoreSpeeding * trip.duration_s;
    memo.hardBrakes += trip.hard_brakes;
    memo.hardAccels += trip.hard_accels;
    memo.speedingSeconds += trip.duration_over_70_s;
    return memo;
  }, {
    distance: 0,
    duration: 0,
    fuel: 0,
    cost: 0,
    sumScoreEvents: 0,
    sumScoreSpeeding: 0,
    hardBrakes: 0,
    hardAccels: 0,
    speedingSeconds: 0
  });

  let scoreEvents = (totals.sumScoreEvents / totals.duration) || 0;
  let scoreSpeeding = (totals.sumScoreSpeeding / totals.duration) || 0;
  totals.score = Math.max(0, scoreEvents) + Math.max(0, scoreSpeeding);

  totals.mpg = (totals.distance / totals.fuel) || 0;

  return {
    distance: formatters.distance(totals.distance),
    duration: formatters.durationHours(totals.duration),
    score: formatters.score(totals.score),
    cost: formatters.costWithUnit(totals.cost),
    mpg: formatters.averageMPG(totals.mpg),
    hardBrakes: totals.hardBrakes,
    hardAccels: totals.hardAccels,
    speedingMinutes: moment.duration(totals.speedingSeconds, 'seconds').asMinutes().toFixed()
  };
};

exports.calculateDistanceMi = function(lat1, lon1, lat2, lon2) {
  function toRadians(degree) {
    return (degree * (Math.PI / 180));
  }
  const radius = 3959.0; //Earth Radius in mi
  let radianLat1 = toRadians(lat1);
  let radianLon1 = toRadians(lon1);
  let radianLat2 = toRadians(lat2);
  let radianLon2 = toRadians(lon2);
  let radianDistanceLat = radianLat1 - radianLat2;
  let radianDistanceLon = radianLon1 - radianLon2;
  let sinLat = Math.sin(radianDistanceLat / 2.0);
  let sinLon = Math.sin(radianDistanceLon / 2.0);
  let a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2.0);
  let d = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return d;
};
