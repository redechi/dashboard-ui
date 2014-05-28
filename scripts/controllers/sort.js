define([
],
function() {
  'use strict';

  return {
    average_mpg_rev: function (trip) { return -trip.get("average_mpg");}, 
    average_mpg: function (trip) { return trip.get("average_mpg");}, 
    distance_m:  function (trip) { return trip.get("distance_m");},
  };
});
