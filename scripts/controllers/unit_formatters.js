define([
],
function() {
  'use strict';

  return {
    mpg:   function(d) { return d.value + ' mpg'; },
    miles: function(d) { return d.value + ' miles'; },
    hours: function(d) { return d.value + ' hours'; },
    trips: function(d) { return d.value + ' trips'; },
    gallons: function(d) { return d.value + ' gallons'; },
    fuel_cost: function(d) { return '$' + d.value; },
    formatTime: function(time, timezone, format) {
      try {
        return moment(time).tz(timezone).format(format);
      } catch(e) {
        return moment(time).format(format);
      }
    },
    distance: function(distance_m) {
      var distance_mi = this.m_to_mi(distance_m);
      if(Math.round(distance_mi) >= 100) {
        return distance_mi.toFixed(0);
      } else {
        return distance_mi.toFixed(1);
      }
    },
    duration: function(min) {
      var duration = moment.duration(min, "minutes");
      return Math.floor(duration.asHours()) + ':' + moment(duration.minutes(), 'm').format('mm');
    },
    durationMin: function(min) {
      return Math.round(min);
    },
    cost: function(fuelCost) {
      return '$' + fuelCost.toFixed(2);
    },
    averageMPG: function(mpg) {
      return mpg.toFixed(1);
    },
    score: function(score) {
      return Math.round(score);
    },
    mi_to_m: function(mi) { return mi * 1609.34; },
    m_to_mi: function(m) { return m / 1609.34; },
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
