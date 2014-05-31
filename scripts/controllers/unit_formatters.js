define([
],
function() {
  'use strict';

  return {
    mpg:   function(d) { return d.value + ' mpg'; },
    miles: function(d) { return d.value + ' miles'; },
    hours: function(d) { return d.value + ' hours'; },
    trips: function(d) { return d.value + ' trips'; },
    score: function(d) { return d.value + ' trips'; },
    gallons: function(d) { return d.value + ' gallons'; },
    fuel_cost: function(d) { return '$' + d.value; },
    distance_mi: function(lat1, lon1, lat2, lon2) {
      function ToRadians(degree) {
        return (degree * (Math.PI / 180));
      }
      var radius = 3959.0; //Earth Radius in mi
      var radianLat1 = ToRadians(lat1);
      var radianLon1 = ToRadians(lon1);
      var radianLat2 = ToRadians(lat2);
      var radianLon2 = ToRadians(lon2);
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
