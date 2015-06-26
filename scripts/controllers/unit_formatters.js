define([
  'moment'
],
function( moment ) {
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
      if (score < 20) {
        return 'rgb(252, 59, 47)';
      } else if (score < 40) {
        return 'rgb(253, 104, 43)';
      } else if (score < 60) {
        return 'rgb(253, 148, 38)';
      } else if (score < 80) {
        return 'rgb(254, 204, 47)';
      } else if (score < 90) {
        return 'rgb(183, 205, 55)';
      } else if (score < 100) {
        return 'rgb(148, 206, 59)';
      } else if (score === 100) {
        return 'rgb(112, 206, 63)';
      }
    },


    distance: function(distanceMiles) {
      if (Math.round(distanceMiles) >= 100) {
        return distanceMiles.toFixed();
      } else {
        return distanceMiles ? distanceMiles.toFixed(1) : '';
      }
    },


    durationHours: function(min) {
      var duration = moment.duration(min, 'minutes');
      return Math.floor(duration.asHours()) + ':' + moment(duration.minutes(), 'm').format('mm');
    },


    durationMinutes: function(min) {
      if (Math.round(min) >= 100) {
        return min.toFixed();
      } else {
        return (min ? min : 0).toFixed(1);
      }
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
      return Math.round(score) || undefined;
    },


    metersToMiles: function(m) {
      // converts meters to miles
      return m / 1609.34;
    },

    msToSec: function(ms) {
      // converts milliseconds to seconds
      return Math.round(ms / 1000);
    },

    kmplToMpg: function(kmpl) {
      // converts kilometers per liter to miles per gallon
      return kmpl * 2.35214583;
    },

    litersToGal: function(liters) {
      // converts liters to gallons
      return liters * 0.264172;
    },

    dateRange: function(dateRange) {
      return moment(dateRange[0]).format('MMM D - ') + moment(dateRange[1]).format('MMM D, YYYY');
    },

    formatVehicle: function(vehicle) {
      return (vehicle) ? vehicle.get('year') + ' ' + vehicle.get('make') + ' ' + vehicle.get('model') : '';
    },

    parseNumber: function(item) {
      //return text value if unparsable
      var number = parseFloat(item);
      return (isNaN(number)) ? item : number;
    },


    numberWithCommas: function(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    },


    formatDateForGraphLabel: function(binSize, date) {
      if(binSize === 'day') {
        return moment(date).format('MMM D');
      } else if(binSize === 'month') {
        return moment(date).format('MMM YYYY');
      }
    },


    formatAddress: function(address) {
      var formattedAddress = '';

      if(address.street_number) {
        formattedAddress += address.street_number + ' ';
      }
      if(address.street_name) {
        formattedAddress += address.street_name + ', ';
      }
      if(address.city) {
        formattedAddress += address.city;
      }
      if(address.city && address.state) {
        formattedAddress += ', ';
      }
      if(address.state) {
        formattedAddress += address.state;
      }

      return formattedAddress || address.display_name || 'Unknown Address';
    }
  };
});
