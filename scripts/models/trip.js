define([
  'backbone',
  'moment',
  '../controllers/unit_formatters'
],
function( Backbone, moment, formatters ) {
  'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({

    initialize: function(trip) {
      var start_time = this.get('started_at'),
          end_time = this.get('ended_at'),
          duration = moment(end_time).diff(moment(start_time), 'minutes', true),
          miles = formatters.metersToMiles(this.get('distance_m')),
          startAddress = 'Unknown Address',
          endAddress = 'Unknown Address',
          startDisplayName = 'Unknown Address',
          endDisplayName = 'Unknown Address';

      if(this.get('start_address')) {
        startAddress = formatters.formatAddress(this.get('start_address').name);
        startDisplayName = this.get('start_address').display_name || startAddress;
      }

      if(this.get('end_address')) {
        endAddress = formatters.formatAddress(this.get('end_address').name);
        endDisplayName = this.get('end_address').display_name || endAddress;
      }

      this.set({
        duration: duration,
        over60Minutes: (duration >= 60),
        formatted_duration_minutes: Math.round(duration),
        formatted_duration_hours: formatters.durationHours(duration),
        distance_miles: miles,
        formatted_distance_miles: formatters.distance(miles),
        formatted_average_mpg: (this.get('average_mpg') ? this.get('average_mpg').toFixed(1) : ''),
        formatted_fuel_cost_usd: formatters.cost(this.get('fuel_cost_usd')),
        formatted_end_time: (end_time ? moment(end_time).format('h:mm a').toUpperCase() : ''),
        formatted_start_time: (start_time ? moment(start_time).format('h:mm a').toUpperCase(): ''),
        formatted_calendar_date: moment(start_time).calendar(),
        formatted_calendar_date_with_year: moment(start_time).format('MMM D, YYYY'),
        duration_over_70_min: Math.round(this.get('duration_over_70_s') / 60),
        noSpeeding: (this.get('duration_over_70_s') === 0),
        noHardBrakes: (this.get('hard_brakes') === 0),
        noHardAccels: (this.get('hard_accels') === 0),
        startAddress: startAddress,
        endAddress: endAddress,
        startDisplayName: startDisplayName,
        endDisplayName: endDisplayName
      });
    }

  });
});
