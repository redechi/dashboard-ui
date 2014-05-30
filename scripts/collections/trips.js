define([
  'backbone',
  'models/trip',
  '../controllers/aggregate',
  '../controllers/sort',
  'amlCollection'
],
function( Backbone, Trip, aggStrat, sortStrat, filterStrat) {
  'use strict';

  var lastFetch = undefined;

  /* trips singleton */
  var Trips = Backbone.AML.Collection.extend({

    name: 'default_collection',

    page: 0,

    initialize: function() {
      console.log("initialize a Trips collection");
      window.tripss = this
    },

    url: "https://api.automatic.com/v1/trips",

    getLastFetch: function () {
      if (!lastFetch) return;
      return lastFetch;
    },

    fetchAll: function () {
      this.nextSet().always(_.bind(
        function(data, status, jqXHR) {
          if (!!data[0]) return this.nextSet();

          // hackaround jquery request abort (caching)
          if (status instanceof Array && !!status[0]) {
            this.nextSet();
          }
          if ( data[0] && status[0] ){
            this.page = 0;
          }

          lastFetch = this.clone();
        }
      , this));
    },

    nextSet: function(){
      this.page++
      return this.fetch({add : true, remove: false,
        data: {
          page: this.page,
          per_page: 30
        }
      })
    },

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
