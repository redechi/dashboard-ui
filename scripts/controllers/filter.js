// All filters should return an array. This array should be dependancy injected
// in to the appropriate collection from within the collection its self.

define([
  './unit_formatters',
  '../collections/vehicles'
],
function( formatters, vehiclesCollection ) {
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
      },
      updateValueText: function () {
        var valueText;
        if(this.get('value') === 'all') {
          valueText = 'all vehicles';
        } else {
          var vehicle = vehiclesCollection.get(this.get('value'));
          valueText = (vehicle) ? vehicle.get('display_name') : 'Unknown';
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        return this.get('value');
      },
      fromURL: function(value) {
        if(!value) { return; }
        this.set('value', value);
      }
    },



    date: {
      name: 'date',
      title: 'date of trip',
      label: 'driven',
      valueText: 'in the last 30 days',
      valueSelected: 'last30Days',
      value: [moment().endOf('day').subtract('months', 1).valueOf(), moment().endOf("day").valueOf()],
      options: {
        thisWeek: 'this week',
        thisMonth: 'this month',
        last30Days: 'in the last 30 days',
        thisYear: 'this year',
        allTime: 'all time',
        custom: 'custom'
      },
      func: function(trip) {
        return trip.get('start_time') >= this.get('value')[0] && trip.get('start_time') <= this.get('value')[1];
      },
      getValue: function(valueSelected) {
        if(valueSelected === 'thisWeek') {
          return [moment().startOf('week').valueOf(), moment().endOf('week').valueOf()];
        } else if(valueSelected === 'thisMonth') {
          return [moment().startOf('month').valueOf(), moment().endOf('month').valueOf()];
        } else if(valueSelected === 'last30Days') {
          return [moment().endOf('day').subtract('days', 30).valueOf(), moment().endOf('day').valueOf()];
        } else if(valueSelected === 'thisYear') {
          return [moment().startOf('year').valueOf(), moment().endOf('year').valueOf()];
        } else if(valueSelected === 'allTime') {
          return [Date.parse('Mar 12, 2013'), moment().endOf('day').valueOf()];
        } else if(valueSelected === 'custom') {
          return this.get('value');
        }
      },
      updateValueText: function() {
        var valueText = this.get('options')[this.get('valueSelected')];
        if(valueText === 'custom' || !valueText) {
          valueText = formatters.dateRange(this.get('value'));
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        var value = this.get('value').slice();
        value.push(this.get('valueSelected'));
        return value.join(',');
      },
      fromURL: function (value) {
        if(!value) { return; }
        var values = value.split(',');
        if(values[2] === 'custom') {
          this.set('value', [values[0], values[1]].map(formatters.parseNumber));
        } else {
          this.set('value', this.get('getValue').call(this, values[2]));
        }
        this.set('valueSelected', values[2]);
      },
      trimDate: function (value) {
        //Remove future and ancient dates
        if(!value || value === 'NaN') {
          return moment().endOf('day').valueOf();
        } else if(value > moment().endOf('day').valueOf()) {
          return moment().endOf('day').valueOf();
        } else if(value <= Date.parse('Mar 12, 2013')) {
          return Date.parse('Mar 12, 2013');
        } else {
          return value;
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
      formatter: function(d) { return d + ' mi'; },
      updateValueText: function() {
        if(this.get('value')[0] === 0 && this.get('value')[1] === Infinity) {
          var valueText = 'all distances';
        } else {
          var valueText = 'between ' + this.get('value').join(' - ') + ' miles';
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        return this.get('value').join(',');
      },
      fromURL: function (value) {
        if(!value) { return; }
        value = value.split(',').map(formatters.parseNumber);
        this.set('value', value);
      }
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
      formatter: function(d) { return d + ' min'; },
      updateValueText: function() {
        if(this.get('value')[0] === 0 && this.get('value')[1] === Infinity) {
          var valueText = 'all durations';
        } else {
          var valueText = 'between ' + this.get('value').join(' - ') + ' minutes';
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        return this.get('value').join(',');
      },
      fromURL: function (value) {
        if(!value) { return; }
        value = value.split(',').map(formatters.parseNumber);
        this.set('value', value);
      }
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
      formatter: function(d) { return '$' + d; },
      updateValueText: function() {
        if(this.get('value')[0] === 0 && this.get('value')[1] === Infinity) {
          var valueText = 'all costs';
        } else {
          var valueText = 'between ' + this.get('value').map(formatters.costWithUnit).join(' - ');
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        return this.get('value').join(',');
      },
      fromURL: function (value) {
        if(!value) { return; }
        value = value.split(',').map(formatters.parseNumber);
        this.set('value', value);
      }
    },


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
      },
      updateValueText: function () {
        if(this.get('value')[0] === 0 && this.get('value')[1] === 24) {
          var valueText = 'all times of day';
        } else {
          var valueText = 'between ' + this.get('value').map(function(time) {
            return formatters.formatTime(moment(time, 'hours').valueOf(), null, 'h A');
          }).join(' - ');
        }
        this.set('valueText', valueText);
      },
      toURL: function () {
        return this.get('value').join(',');
      },
      fromURL: function (value) {
        if(!value) { return; }
        value = value.split(',').map(formatters.parseNumber);
        this.set('value', value);
      }
    }
  };

});
