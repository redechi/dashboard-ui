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

