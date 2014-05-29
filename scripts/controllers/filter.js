// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
],
function() {
  'use strict';

  return {
    gt_cost: function (cost) {
      return function(trip) { return trip.get("fuel_cost_usd") > cost; };
    },

    lt_cost: function (cost) {
      return function(trip) { return trip.get("fuel_cost_usd") < cost; };
    },

    lt_distance_m: function (distance) {
      return function(trip) { return trip.get("distance_m") < distance; };
    },

    gt_distance_m: function (distance) {
      return function(trip) { return trip.get("distance_m") > distance; };
    }
  }
});
