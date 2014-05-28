define([
],
function() {
  return {
    distance: function (memo, trip) {
      'use strict';
      if (typeof memo !== 'number') memo = 0;
      return memo + parseFloat(trip.get("distance_m"));
    }
  }
});
