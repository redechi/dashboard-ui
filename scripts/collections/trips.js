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
    },

    url: "http://localhost:8080/v1/trips",

    model: Trip

  });
});
