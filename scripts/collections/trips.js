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

      return (weightedSum.score / weightedSum.time) || 0;
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
    },

    calculateRanges: function() {
      var memo = {
        distance: {min: Infinity, max: 0},
        duration: {min: Infinity, max: 0},
        cost: {min: Infinity, max: 0}
      };
      return this.reduce(function(memo, trip) {
        return {
          distance: {
            min: Math.min(trip.get('distance_miles'), memo.distance.min),
            max: Math.max(trip.get('distance_miles'), memo.distance.max)
          },
          duration: {
            min: Math.min(trip.get('duration'), memo.duration.min),
            max: Math.max(trip.get('duration'), memo.duration.max)
          },
          cost: {
            min: Math.min(trip.get('fuel_cost_usd'), memo.cost.min),
            max: Math.max(trip.get('fuel_cost_usd'), memo.cost.max)
          },
        };
      }, memo);
    }
  });

  // make this a singleton
  return new Trips();
});
