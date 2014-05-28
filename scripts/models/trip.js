define([
  'backbone'
],
function( Backbone ) {
  'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function(trip) {
      console.log('initialize a Trip model');

      // format values
      this.set('average_mpg', parseInt(this.get('average_mpg') * 100) /100);
      this.set('fuel_cost_usd', parseInt(this.get('fuel_cost_usd') * 100) /100);
    },

    url: function () {
      return 'http://localhost:8080/v1/trips/' + this.get('id');
    },

    defaults: {
    },

  });
});
