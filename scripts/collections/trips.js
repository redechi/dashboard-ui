define([
  'backbone',
  'communicator',
  'models/trip'

// if the sort and sumation strategies grow much larger we should
// break them in to seperate files.
//
//  '../../controllers/aggStrategies', 
//  '../../controllers/sortStrategies'

],
function( Backbone, Communicator, Trip ) {
    'use strict';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    events: {
      'all': 'proxyEvent'
    },

    initialize: function() {
      console.log("initialize a Trips collection");
      window.trips = this;
    },

    url: "http://localhost:8080/v1/trips",

    // aggregation strategies
    aggStragegies: {
      distance: function (memo, trip) {
        if (typeof memo !== 'number') memo = 0;
        return memo + parseFloat(trip.get("distance_m"));
      }
    },

    // sorting strategies
    sortStrategies: {
      average_mpg_rev: function (trip) { return -trip.get("average_mpg");}, 
      average_mpg: function (trip) { return trip.get("average_mpg");}, 
      distance_m:  function (trip) { return trip.get("distance_m");},
    },

    // the default aggregation strategy
    sumator: function (memo, value) {
      return this.aggStragegies.distance(memo, value);
    },

    // the default comparitor for sorting
    comparitor: function (trip) {
      return this.sortStrategies.average_mpg(trip);
    },

    // return the aggregated value.
    aggregate: function () {
      var value = this.reduce(this.sumator);
      this.trigger('aggregate', value);
      return value;
    },

    // sets the current sort property for this collection
    setSort: function (sortProperty) {
      this.comparator = this.sortStrategies[sortProperty];
      return this;
    },

    // sets the current aggregation strategy for this collection
    setAgg: function (aggProperty) {
      this.sumator = this.aggStragegies[aggProperty];
      return this;
    },

    model: Trip
  });

  // make this a singleton
  return new Trips();
});
