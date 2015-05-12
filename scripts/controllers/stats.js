define([
  'controllers/unit_formatters'
],
function(formatters) {
  'use strict';

  return {
    getAverageScore: function(trips) {
      if(!trips.length) {
        return 0;
      }
      var weightedSum = trips.reduce(function(memo, trip) {
        var scoreEvents = trip.get('score_events'),
            scoreSpeeding = trip.get('score_speeding');
        if (scoreEvents && scoreSpeeding) {
          memo.scoreEvents += scoreEvents * trip.get('duration');
          memo.scoreSpeeding += scoreSpeeding * trip.get('duration');
          memo.time += trip.get('duration');
        }
        return memo;
      }, {time: 0, scoreEvents: 0, scoreSpeeding: 0});

      var scoreEvents = (weightedSum.scoreEvents / weightedSum.time) || 0,
          scoreSpeeding = (weightedSum.scoreSpeeding / weightedSum.time) || 0,
          score = Math.max(0, scoreEvents) + Math.max(0, scoreSpeeding);

      return Math.min(Math.max(1, score), 100);
    },


    getSum: function(trips, field) {
      return trips.reduce(function(memo, trip) {
        return memo + trip.get(field);
      }, 0);
    },


    getAverageMPG: function(trips) {
      var totals = trips.reduce(function(memo, trip) {
        memo.distance += formatters.metersToMiles(trip.get('distance_m'));
        memo.fuel += trip.get('fuel_volume_gal');
        return memo;
      }, {distance: 0, fuel: 0});
      return (totals.distance / totals.fuel) || 0;
    },


    sumTrips: function(trips, field) {
      //Calculate sum or average, depending on field
      if(field === 'average_mpg') {
        return this.getAverageMPG(trips);
      } else if(field === 'score') {
        return this.getAverageScore(trips);
      } else {
        return this.getSum(trips, field);
      }
    },


    calculateDistanceMi: function(lat1, lon1, lat2, lon2) {
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
    }
  };
});
