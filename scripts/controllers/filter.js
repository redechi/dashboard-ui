define([
],
function() {
  'use strict';

  // should return an array
  return {
    less_distance_m: function (distance) {
      'use strict';
      var filtered = this.filter(function(trip) {
        return trip.get("distance_m") < distance;
      });

      return filtered;
    },

    greater_distance_m: function (distance) {
      'use strict';
      var filtered = this.filter(function(trip) {
        return trip.get("distance_m") > distance;
      });

      return filtered;
    }
  }
});
