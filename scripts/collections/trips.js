define([
  'backbone',
  'models/trip'
],
function( Backbone, Trip ) {
    'use strict';

  /* Return a collection class definition */
  return Backbone.Collection.extend({

    initialize: function() {
      console.log("initialize a Trips collection");
      window.trip = this;
    },

    url: "http://localhost:8080/v1/trips",

    strategies: {
      average_mpg_rev: function (trip) { return -trip.get("average_mpg"); }, 
      average_mpg: function (trip) { return trip.get("average_mpg"); }, 
      distance_m:  function (trip) { return trip.get("distance_m"); },
    },

    comparitor: function (trip) {
      return this.strategies.average_mpg(trip);
    },

    changeSort: function (sortProperty) {
      this.comparator = this.strategies[sortProperty];
      return this;
    },

    model: Trip

  });
});
