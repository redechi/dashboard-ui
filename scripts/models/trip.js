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
      var started_at = this.get('started_at'),
          ended_at = this.get('ended_at'),
          duration = moment(ended_at).diff(moment(started_at), 'minutes', true),
          miles = formatters.metersToMiles(this.get('distance_m')),
          startAddress = 'Unknown Address',
          endAddress = 'Unknown Address',
          startDisplayName = 'Unknown Address',
          endDisplayName = 'Unknown Address';

      if(this.get('start_address')) {
        startAddress = formatters.formatAddress(this.get('start_address'));
        startDisplayName = this.get('start_address').display_name || startAddress;
      }

      if(this.get('end_address')) {
        endAddress = formatters.formatAddress(this.get('end_address'));
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
        formatted_ended_at: (ended_at ? moment(ended_at).format('h:mm a').toUpperCase() : ''),
        formatted_started_at: (started_at ? moment(started_at).format('h:mm a').toUpperCase(): ''),
        formatted_calendar_date: moment(started_at).calendar(),
        formatted_calendar_date_with_year: moment(started_at).format('MMM D, YYYY'),
        duration_over_70_min: Math.round(this.get('duration_over_70_s') / 60),
        noSpeeding: (this.get('duration_over_70_s') === 0),
        noHardBrakes: (this.get('hard_brakes') === 0),
        noHardAccels: (this.get('hard_accels') === 0),
        startAddress: startAddress,
        endAddress: endAddress,
        startDisplayName: startDisplayName,
        endDisplayName: endDisplayName,
        taggedBusiness: _.contains(this.get('tags'), 'business')
      });
    }

  });
});
