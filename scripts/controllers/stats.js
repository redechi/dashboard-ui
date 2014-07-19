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

    sumTrips: function(trips, field) {
      //Calculate sum or average, depending on field
      if(field == 'average_mpg') {
        return this.getAverageMPG(trips);
      } else if(field == 'score') {
        return this.getAverageScore(trips);
      } else {
        return this.getSum(trips, field);
      }
    },

    calculate_distance_mi: function(lat1, lon1, lat2, lon2) {
      function toRadians(degree) {
        return (degree * (Math.PI / 180));
      }
      var radius = 3959.0; //Earth Radius in mi
      var radianLat1 = toRadians(lat1);
      var radianLon1 = toRadians(lon1);
      var radianLat2 = toRadians(lat2);
      var radianLon2 = toRadians(lon2);
      var radianDistanceLat = radianLat1 - radianLat2;
      var radianDistanceLon = radianLon1 - radianLon2;
      var sinLat = Math.sin(radianDistanceLat / 2.0);
      var sinLon = Math.sin(radianDistanceLon / 2.0);
      var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2.0);
      var d = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
      return d;
    },

  };
});
