define([
],
function() {
  'use strict';

  return {
    getAverageScore: function(trips) {
      var weightedSum = trips.reduce(function(memo, trip) {
        memo.score += trip.get('score') * trip.get('duration');
        memo.time += trip.get('duration');
        return memo;
      }, {time: 0, score: 0});

      return (weightedSum.score / weightedSum.time) || 0;
    },

    getSum: function(trips, field) {
      return trips.reduce(function(memo, trip) {
        return memo + trip.get('distance_miles');
      }, 0);
    },

    getAverageMPG: function(trips) {
      var totals = trips.reduce(function(memo, trip) {
        memo.distance += trip.get('distance_miles');
        memo.fuel += trip.get('fuel_volume_gal');
        return memo;
      }, {distance: 0, fuel: 0});
      return (totals.distance / totals.fuel) || 0;
    },

  };
});
