define([
],
function() {
  'use strict';

  return {
    mpg: function(d) { return d.value + ' mpg'; },
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
    scoreColor: function (score) {
      if (score < 20) return 'rgb(252, 59, 47)';
      if (score < 40) return 'rgb(253, 104, 43)';
      if (score < 60) return 'rgb(253, 148, 38)';
      if (score < 80) return 'rgb(254, 204, 47)';
      if (score < 90) return 'rgb(183, 205, 55)';
      if (score < 100) return 'rgb(148, 206, 59)';
      if (score == 100) return 'rgb(112, 206, 63)';
    },
    distance: function(distance_miles) {
      if (Math.round(distance_miles) >= 100) {
        return distance_miles.toFixed(0);
      } else {
        return ((distance_miles) ? distance_miles : 0).toFixed(1);
      }
    },
    durationHours: function(min) {
      var duration = moment.duration(min, 'minutes');
      return Math.floor(duration.asHours()) + ':' + moment(duration.minutes(), 'm').format('mm');
    },
    durationMinutes: function(min) {
      return min ? min.toFixed(1) : 0;
    },
    cost: function(fuelCost) {
      return ((fuelCost) ? fuelCost : 0).toFixed(2);
    },
    costWithUnit: function(fuelCost) {
      return '$' + ((fuelCost) ? fuelCost : 0).toFixed(2);
    },
    averageMPG: function(mpg) {
      return mpg ? mpg.toFixed(1) : 0;
    },
    score: function(score) {
      return Math.round(score);
    },
    m_to_mi: function(m) { return m / 1609.34; },
    dateRange: function(dateRange) {
      return moment(dateRange[0]).format('MMM D - ') + moment(dateRange[1]).format('MMM D, YYYY');
    },
    parseNumber: function(item) {
      //return text value if unparsable
      var number = parseFloat(item);
      return (isNaN(number)) ? item : number;
    },
    formatForGraphLabel: function(graphType, value) {
      if(graphType === 'fuel_cost_usd') {
        return this.costWithUnit(value);
      } else if (graphType === 'score') {
        return this.score(value);
      } else if (graphType === 'duration') {
        return this.durationMinutes(value);
      } else if (graphType === 'average_mpg') {
        return this.averageMPG(value);
      } else if (graphType === 'distance_miles') {
        return this.distance(value);
      }
    }
  };
});
