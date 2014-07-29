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
      console.log('initialize a Trip model');

      moment.lang('en', {
        calendar : {
          lastDay : '[Yesterday]',
          sameDay : '[Today]',
          nextDay : '[Tomorrow]',
          lastWeek : 'MMM DD',
          nextWeek : 'MMM DD',
          sameElse : 'MMM DD'
        }
      });

      // format values
      var duration = ((this.get('end_time') - this.get('start_time')) / (1000 * 60)),
          miles = formatters.m_to_mi(this.get('distance_m'));

      this.set('duration', duration);
      this.set('formatted_duration', Math.round(duration));
      this.set('distance_miles', miles);
      this.set('formatted_distance_miles', formatters.distance(miles));
      this.set('formatted_average_mpg', Math.round(this.get('average_mpg')));
      this.set('formatted_fuel_cost_usd', parseInt(this.get('fuel_cost_usd') * 100) / 100);
      this.set('formatted_end_time', moment(this.get('end_time')).format('h:mm a').toUpperCase());
      this.set('formatted_start_time', moment(this.get('start_time')).format('h:mm a').toUpperCase());
      this.set('formatted_calendar_date', moment(this.get('start_time')).calendar());
      this.set('duration_over_70_min', Math.ceil(this.get('duration_over_70_s') / 60));
    }

  });
});
