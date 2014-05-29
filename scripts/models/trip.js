define([
  'backbone',
  'moment'
],
function( Backbone, moment ) {
  'use strict';

  var MILE_CONVERSION = 1609.34;

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function(trip) {
      console.log('initialize a Trip model');

      // format values
      var duration = ((this.get('end_time') - this.get('start_time')) / 1000 / 60);
      var miles = this.get('distance_m')/MILE_CONVERSION;
      miles = parseInt(miles * 100) /100;
      duration = parseInt(duration * 100)/100;

      this.set('duration', duration);
      this.set('distance_miles', miles);
      this.set('average_mpg', parseInt(this.get('average_mpg') * 100) /100);
      this.set('fuel_cost_usd', parseInt(this.get('fuel_cost_usd') * 100) /100);
      this.set('formatted_end_time', moment(this.get('end_time')).format('MMMM Do YYYY, h:mm:ss a'));
      this.set('formatted_start_time', moment(this.get('start_time')).format('h:mm a'));
    },

    url: function () {
      return 'https://api.automatic.com/v1/trips/' + this.get('id');
    },

    defaults: {
    },

  });
});
