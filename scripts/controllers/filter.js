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
      title: 'By Vehicle',
      label: 'Show trips from',
      value: 'all',
      valueText: 'All Vehicles',
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
      title: 'By Date Range',
      label: 'during',
      dateType: 'thisMonth',
      valueText: 'This Month',
      offset: 0,
      value: [moment().startOf('month').valueOf(), moment().endOf("month").valueOf()],
      setRange: function (dateType) {
        var offset = this.get('offset');
        // default to weekly
        var range = [
          moment().startOf('week').add('week', offset).valueOf(),
          moment().endOf("week").add('week', offset).valueOf()
        ];

        if(dateType == 'month') {
          range = [
            moment().startOf('month').add('month', offset).valueOf(),
            moment().endOf("month").add('month', offset).valueOf()
          ];
        }


        if(dateType == 'day') {
          range = [
            moment().startOf('day').add('day', offset).valueOf(),
            moment().endOf("day").add('day', offset).valueOf()
          ];
        }

        // update text offset
        if (offset === -1 && dateType === 'day') {
          this.set('valueText', 'Yesterday');
          this.set('dateType', 'yesterday');
        }


        // update text offset
        if (offset === -1 && dateType === 'month') {
          this.set('valueText', 'Last Month');
          this.set('dateType', 'lastMonth');
        }

        // update text offset
        if (offset === -1 && dateType === 'week') {
          this.set('valueText', 'Last Week');
          this.set('dateType', 'lastWeek');
        }


        return range;
      },
      func: function(trip) {
        return this.get('setRange').call(this, 'month');
      },
      setPrevRange: function() {
        var range = this.get('value'),
            rangeLength = range[1] - range[0];
        this.set('value', [range[0] - rangeLength, parseInt(range[0], 10)]);
      },
      setNextRange: function() {
        var range = this.get('value'),
            rangeLength = range[1] - range[0];
        this.set('value', [parseInt(range[1], 10), range[1] + rangeLength]);
      }
    },



    distance: {
      name: 'distance',
      title: 'By Distance',
      label: 'and',
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
      label: 'and',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'All Durations',
      func: function(trip) {
        return trip.get("duration") >= this.get('value')[0] && trip.get("duration") <= this.get('value')[1];
      },
      formatter: function(d) { return d + ' min'; }
    },


    /*
     * TODO: describe this filter better
     *
     * Filter by total cost.
     *
     */
    cost: {
      name: 'cost',
      title: 'By Cost',
      label: 'and',
      min: 0,
      max: 100,
      value: [0, Infinity],
      valueText: 'All Costs',
      func: function(trip) {
        return trip.get("fuel_cost_usd") >= this.get('value')[0] && trip.get("fuel_cost_usd") <= this.get('value')[1];
      },
      formatter: function(d) { return '$' + d; }
    },




    /*
     * TODO: describe this filter better
     *
     * Filter by distance from location.
     *
     */
    location: {
      name: 'location',
      title: 'By Location',
      label: 'and',
      latlng: [0,0],
      type: undefined,
      valueText: 'Everywhere',
      func: function(trip) {
        var radius_mi = 0.1;
        if(this.get('type') == 'start') {
          return formatters.distance_mi(trip.get('start_location').lat, trip.get('start_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        } else if(this.get('type') == 'end') {
          return formatters.distance_mi(trip.get('end_location').lat, trip.get('end_location').lon, this.get('latlng')[0], this.get('latlng')[1]) <= radius_mi;
        } else {
          return true;
        }
      }
    },




    /*
     * TODO: describe this filter better
     *
     * Filter between two time values.
     *
     */
    time: {
      name: 'time',
      title: 'By Time of Day',
      label: 'and',
      min: 0,
      max: 24,
      value: [0, Infinity],
      valueText: 'All Times',
      func: function(trip) {
        return moment(trip.get("start_time")).hour() >= this.get('value')[0] && moment(trip.get("end_time")).hour() <= this.get('value')[1];
      },
      formatter: function(d) {
        return moment.utc(d * 60 * 60 * 1000).format('h A');
      }
    }
  };

});
