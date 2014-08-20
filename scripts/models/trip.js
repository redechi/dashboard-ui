define([
  'backbone',
  '../controllers/unit_formatters',
  '../controllers/login'
],
function( Backbone, formatters, login ) {
  'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({

    url: function () {
      return login.getAPIUrl() + '/v1/trips/' + this.get('id');
    },


    initialize: function(trip) {
      var duration = ((this.get('end_time') - this.get('start_time')) / (1000 * 60)),
          miles = formatters.m_to_mi(this.get('distance_m'));

      this.set({
        duration: duration,
        over60Minutes: (duration >= 60),
        formatted_duration_minutes: Math.round(duration),
        formatted_duration_hours: formatters.durationHours(duration),
        distance_miles: miles,
        formatted_distance_miles: formatters.distance(miles),
        formatted_average_mpg: Math.round(this.get('average_mpg')),
        formatted_fuel_cost_usd: formatters.cost(this.get('fuel_cost_usd')),
        formatted_end_time: (this.get('end_time') ? moment(this.get('end_time')).format('h:mm a').toUpperCase() : ''),
        formatted_start_time: (this.get('start_time') ? moment(this.get('start_time')).format('h:mm a').toUpperCase(): ''),
        formatted_calendar_date: moment(this.get('start_time')).calendar(),
        formatted_calendar_date_with_year: moment(this.get('start_time')).format('MMM D, YYYY'),
        duration_over_70_min: Math.ceil(this.get('duration_over_70_s') / 60),
        noSpeeding: (this.get('duration_over_70_s') === 0),
        noHardBrakes: (this.get('hard_brakes') === 0),
        noHardAccels: (this.get('hard_accels') === 0),
        startAddress: (this.get('start_location')) ? formatters.formatAddress(this.get('start_location').name) : 'Unknown Address',
        endAddress: (this.get('end_location')) ? formatters.formatAddress(this.get('end_location').name) : 'Unknown Address'
      });
    }

  });
});
