// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
  'moment',
  './unit_formatters',
],
function(moment, formatters) {
  'use strict';

  return {

    vehicle: {
      name: 'vehicle',
      title: 'vehicle',
      label: 'Show trips from',
      value: 'all',
      valueText: 'all vehicles',
      func: function(trip) {
        if(this.get('value') === 'all') {
          return true;
        } else {
          return (this.get('value') === trip.get("vehicle").id);
        }
      },
      queryify: function () {
        return this.get('value');
      }
    },



    date: {
      name: 'date',
      title: 'date of trip',
      label: 'driven',
      valueText: 'in the last 30 days',
      valueSelected: 'last30Days',
      value: [moment().startOf('month').valueOf(), moment().endOf("month").valueOf()],
      func: function(trip) {
        return trip.get('start_time') >= this.get('value')[0] && trip.get('start_time') <= this.get('value')[1];
      },
      getValue: function(valueSelected) {
        if(valueSelected === 'thisWeek') {
          return [moment().startOf('week').valueOf(), moment().endOf('week').valueOf()];
        } else if(valueSelected === 'thisMonth') {
          return [moment().startOf('month').valueOf(), moment().endOf('month').valueOf()];
        } else if(valueSelected === 'last30Days') {
          return [moment().subtract('days', 30).valueOf(), moment().valueOf()];
        } else if(valueSelected === 'thisYear') {
          return [moment().startOf('year').valueOf(), moment().endOf('year').valueOf()];
        } else if(valueSelected === 'allTime') {
          return [0, 2147483648000];
        } else if(valueSelected === 'custom') {
            //do custom
        }
      }
    },



    distance: {
      name: 'distance',
      title: 'distance traveled',
      label: 'and',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'all distances',
      func: function(trip) {
        return trip.get("distance_m") >= formatters.mi_to_m(this.get('value')[0]) && trip.get("distance_m") <= formatters.mi_to_m(this.get('value')[1]);
      },
      formatter: function(d) { return d + ' mi'; }
    },



    duration: {
      name: 'duration',
      title: 'duration of trip',
      label: 'and',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'all durations',
      func: function(trip) {
        return trip.get("duration") >= this.get('value')[0] && trip.get("duration") <= this.get('value')[1];
      },
      formatter: function(d) { return d + ' min'; }
    },


    cost: {
      name: 'cost',
      title: 'fuel cost',
      label: 'and',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'all costs',
      func: function(trip) {
        return trip.get("fuel_cost_usd") >= this.get('value')[0] && trip.get("fuel_cost_usd") <= this.get('value')[1];
      },
      formatter: function(d) { return '$' + d; }
    },



    /*
     * TODO: describe this filter better
     *
     * Filter between two time values.
     *
     */
    time: {
      name: 'time',
      title: 'time of day',
      label: 'and',
      min: 0,
      max: 24,
      value: [0, Infinity],
      valueText: 'all times of day',
      func: function(trip) {
        return moment(trip.get("start_time")).hour() >= this.get('value')[0] && moment(trip.get("end_time")).hour() <= this.get('value')[1];
      },
      formatter: function(d) {
        return moment.utc(d * 60 * 60 * 1000).format('h A');
      }
    }
  };

});
