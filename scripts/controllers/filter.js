// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
  './unit_formatters',
],
function(formatters) {
  'use strict';

  return {
    date: {
      name: 'date',
      title: 'By Date Range',
      value: 'thisMonth',
      dateRange: [0,0],
      func: function(trip) {
        return moment(trip.get('start_time')) >= moment(this.get('dateRange')[0]) && moment(trip.get('start_time')) <= moment(this.get('dateRange')[1]);
      }
    },
    vehicle: {
      name: 'vehicle',
      title: 'By Vehicle',
      vehicle_ids: [],
      func: function(trip) {
        return _.contains(this.get('vehicle_ids'), trip.get("vehicle").id);
      }
    },
    distance: {
      name: 'distance',
      title: 'By Distance',
      min: 0,
      max: Infinity,
      func: function(trip) {
        return trip.get("distance_m") >= this.get('min') && trip.get("distance_m") <= this.get('max');
      }
    },
    duration: {
      name: 'duration',
      title: 'By Duration',
      min: 0,
      max: Infinity,
      func: function(trip) {
        return trip.get("duration") >= this.get('min') && trip.get("duration") <= this.get('max');
      }
    },
    cost: {
      name: 'cost',
      title: 'By Cost',
      min: 0,
      max: Infinity,
      func: function(trip) {
        return trip.get("fuel_cost_usd") >= this.get('min') && trip.get("fuel_cost_usd") <= this.get('max');
      }
    },
    location: {
      name: 'location',
      title: 'By Location',
      latlng: [0,0],
      type: undefined,
      func: function(trip) {
        var radius_mi = 0.1;
        if(this.get('type') == 'from') {
          return formatters.distance_mi(trip.get('start_location').lat, trip.get('start_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        } else {
          return formatters.distance_mi(trip.get('end_location').lat, trip.get('end_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        }
      }
    }
  };

});
