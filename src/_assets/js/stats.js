import moment from 'moment';

const formatters = require('./formatters');

exports.calculateTotals = function(trips) {
  if(!trips) {
    return false;
  }

  let totals = trips.reduce((memo, trip) => {
    memo.distance += trip.distance_miles;
    memo.duration += trip.duration_s;
    memo.fuel += trip.fuel_volume_gal;
    memo.cost += trip.fuel_cost_usd;
    memo.sumScoreEvents += trip.score_events * trip.duration_s;
    memo.sumscoreSpeeding += trip.score_speeding * trip.duration_s;
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
    speedingMinutes: moment.duration(totals.speedingSeconds, 'seconds').asMinutes().toFixed(),
    maximums: totals.maximums
  };
};

exports.calculateMaxiumums = function(trips) {
  if(!trips) {
    return {
      distance: 100,
      duration: 100,
      cost: 100,
      time: 24
    };
  }

  return trips.reduce((memo, trip) => {
    memo.distance = Math.max(memo.distance, Math.ceil(trip.distance_miles));
    memo.duration = Math.max(memo.duration, Math.ceil(trip.duration_s));
    memo.cost = Math.max(memo.cost, Math.ceil(trip.fuel_cost_usd));
    return memo;
  }, {
    distance: 0,
    duration: 0,
    cost: 0,
    time: 24
  });
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

exports.sumTrips = function(trips, field) {
  //Calculate sum or average, depending on field
  if(field === 'cost') {
    return getSum(trips, 'fuel_cost_usd');
  } else if (field === 'score') {
    return getAverageScore(trips);
  } else if (field === 'duration') {
    return getSum(trips, 'duration_s');
  } else if (field === 'mpg') {
    return getAverageMPG(trips);
  } else if (field === 'distance') {
    return getSum(trips, 'distance_miles');
  }
};

function getAverageMPG(trips) {
  let totals = trips.reduce((memo, trip) => {
    memo.distance += trip.distance_miles;
    memo.fuel += trip.fuel_volume_gal;
    return memo;
  }, {distance: 0, fuel: 0});
  return (totals.distance / totals.fuel) || 0;
}

function getAverageScore(trips) {
  if(!trips.length) {
    return 0;
  }

  let weightedSum = trips.reduce((memo, trip) => {
    if (trip.score_events && trip.score_speeding) {
      memo.scoreEvents += trip.score_events * trip.duration_s;
      memo.scoreSpeeding += trip.score_speeding * trip.duration_s;
      memo.time += trip.duration_s;
    }
    return memo;
  }, {time: 0, scoreEvents: 0, scoreSpeeding: 0});

  let scoreEvents = (weightedSum.scoreEvents / weightedSum.time) || 0;
  let scoreSpeeding = (weightedSum.scoreSpeeding / weightedSum.time) || 0;
  let score = Math.max(0, scoreEvents) + Math.max(0, scoreSpeeding);

  return Math.min(Math.max(1, score), 100);
};


function getSum(trips, field) {
  return trips.reduce((memo, trip) => memo + trip[field], 0);
};
