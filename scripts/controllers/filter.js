// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
  'moment',
  './unit_formatters',
],
function(moment, formatters) {
  'use strict';

  return {
    date: {
      name: 'date',
      title: 'By Date Range',
      value: 'thisMonth',
      valueText: 'This Month',
      dateRange: [moment().startOf('month').valueOf(), moment().endOf("month").valueOf()],
      func: function(trip) {
        return moment(trip.get('start_time')) >= moment(this.get('dateRange')[0]) && moment(trip.get('start_time')) <= moment(this.get('dateRange')[1]);
      }
    },
    vehicle: {
      name: 'vehicle',
      title: 'By Vehicle',
      vehicle_ids: ['all'],
      value: 'all',
      valueText: 'All Vehicles',
      func: function(trip) {
        if(_.contains(this.get('vehicle_ids'), 'all')) {
          return true;
        } else {
          return _.contains(this.get('vehicle_ids'), trip.get("vehicle").id);
        }
      }
    },
    distance: {
      name: 'distance',
      title: 'By Distance',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'All Distances',
      func: function(trip) {
        return trip.get("distance_m") >= formatters.mi_to_m(this.get('value')[0]) && trip.get("distance_m") <= formatters.mi_to_m(this.get('value')[1]);
      },
      formatter: function(d) { return d + ' mi'; }
    },
    duration: {
      name: 'duration',
      title: 'By Duration',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'All Durations',
      func: function(trip) {
        return trip.get("duration") >= this.get('value')[0] && trip.get("duration") <= this.get('value')[1];
      },
      formatter: function(d) { return d + ' min'; }
    },
    cost: {
      name: 'cost',
      title: 'By Cost',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'All Costs',
      func: function(trip) {
        return trip.get("fuel_cost_usd") >= this.get('value')[0] && trip.get("fuel_cost_usd") <= this.get('value')[1];
      },
      formatter: function(d) { return '$' + d; }
    },
    location: {
      name: 'location',
      title: 'By Location',
      latlng: [0,0],
      type: undefined,
      valueText: 'Everywhere',
      func: function(trip) {
        var radius_mi = 0.1;
        if(this.get('type') == 'from') {
          return formatters.distance_mi(trip.get('start_location').lat, trip.get('start_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        } else if(this.get('type') == 'to') {
          return formatters.distance_mi(trip.get('end_location').lat, trip.get('end_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        } else {
          return true;
        }
      }
    }
  };

});
