define([
  'backbone',
  'models/trip',
  'amlAggregate',
  'amlSort',
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

          this.postProcess();
        }
      , this));
    },

    nextSet: function() {
      this.page++;
      return this.fetch({add : true, remove: false,
        data: {
          page: this.page,
          per_page: 30
        }
      });
    },

    getAverageScore: function() {
      var weightedSum = this.reduce(function(memo, trip) {

        memo.score += trip.get('score') * trip.get('duration');
        memo.time += trip.get('duration');
        return memo;
      }, {time: 0, score: 0});

      return weightedSum.score / weightedSum.time;
    },

    // filter strategies
    filterStrategies: filterStrat,

    // sorting strategies
    sortStrategies: sortStrat,

    // aggregation strategies
    aggStragegies: aggStrat,

    model: Trip,

    postProcess: function() {
      lastFetch.forEach(function(model, idx, list) {
        if(idx < (list.length - 1)) {
          model.set('prevTrip', list[idx + 1].get('id'));
        }
        if(idx > 0) {
          model.set('nextTrip', list[idx - 1].get('id'));
        }
      });
    }
  });

  // make this a singleton
  return new Trips();
});
