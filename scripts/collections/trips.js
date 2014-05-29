define([
  'backbone',
  'models/trip',
  '../controllers/aggregate',
  '../controllers/sort',
  '../controllers/filter'
],
function( Backbone, Trip, aggStrat, sortStrat, filterStrat) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.AML.Collection.extend({

    name: 'default_collection',

    initialize: function() {
      console.log("initialize a Trips collection");
      window.trips = this;
    },

    url: "https://api.automatic.com/v1/trips",

    // filter strategies
    filterStrategies: filterStrat,

    // sorting strategies
    sortStrategies: sortStrat,

    // aggregation strategies
    aggStragegies: aggStrat,

    model: Trip

  });

  // make this a singleton
  return new Trips();
});
