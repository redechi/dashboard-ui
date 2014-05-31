// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
],
function() {
  'use strict';

  return {
    date: {
      title: 'By Date Range',
      value: 'thisMonth'
    },
    vehicle: {
      title: 'By Vehicle'
    },
    distance: {
      title: 'By Distance',
      max: Infinity,
      min: 0,
      func: function(trip) {
        return trip.get("distance_m") >= this.get('min') && trip.get("distance_m") <= this.get('max');
      }
    },
    duration: {
      title: 'By Duration',
      max: 0,
      min: 0,
      func: function(trip) {
        return trip.get("duration") >= this.min && trip.get("duration") <= this.max;
      }
    },
    cost: {
      title: 'By Cost',
      max: 0,
      min: 0,
      func: function(trip) {
        return trip.get("fuel_cost_usd") >= this.min && trip.get("fuel_cost_usd") <= this.max;
      }
    },
    location: {
      title: 'By Location'
    }
  };

});
