define([
  'backbone',
  'communicator',
  'models/trip',
  'amlAggregate',
  'amlSort',
  './filters'
],
function( Backbone, coms, Trip, aggStrat, sortStrat, filterCollection) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.AML.Collection.extend({

    page: 0,
    model: Trip,
    aggStragegies: aggStrat,
    sortStrategies: sortStrat,
    name: 'default_collection',
    url: 'https://api.automatic.com/v1/trips',

    initialize: function() {
      console.log('initialize a Trips collection');
      this.on('add', this.convertToLinkedList, this);
      this.on('sync', this.applyAllFilters, this);
      this.on('reset', this.applyAllFilters, this);
    },

    /*
     *
     * creates an array of trips to update and triggers a reset.
     *
     */
    applyAllFilters: function () {
      var tripsCollection = this;
      var tripsToInclude = [];

      this.each(function (tripModel) {
        if (tripsCollection.shouldApplyFilter(tripModel)) {
          tripsToInclude.push(tripModel);
        }
      });

      var newCollection = new this.constructor(tripsToInclude);
      coms.trigger('filter', newCollection);
    },

    /*
     *
     * boolean: determines if any filters apply to model.
     *
     */
    shouldApplyFilter: function (tripModel) {
      var shouldExclude = true;

      filterCollection.each(function (filterModel) {
        var inclusiveFilter = filterModel.applyTo(tripModel);
        if (!inclusiveFilter) {
          shouldExclude = false;
        }
      });

      return shouldExclude;
    },

    /*
     *
     * recursively fetches pages of trips until one returns empty.
     *
     */
    fetchAll: function () {
      return this.nextSet().always(_.bind(
        function(data, status) {

          // hackaround jquery request abort (caching)
          if ( !!data[0] || status instanceof Array && !!status[0] ) {
            this.nextSet();
          }

          this.trigger('fetchComplete');
        }
        , this));
    },

    /*
     *
     * fetches the next page of data and appends it to the collection
     *
     */
    nextSet: function() {
      this.page++;
      return this.fetch({add : true, remove: false,
        data: {
          page: this.page,
          per_page: 30
        }
      });
    },

    /*
     *
     * builds users average score from elements in current collection.
     *
     */
    getAverageScore: function() {
      var weightedSum = this.reduce(function(memo, trip) {

        memo.score += trip.get('score') * trip.get('duration');
        memo.time += trip.get('duration');
        return memo;
      }, {time: 0, score: 0});

      return (weightedSum.score / weightedSum.time) || 0;
    },

    /*
     *
     * on 'add' event link trip model with its previous and next models
     *
     */
    convertToLinkedList: function(model) {
      var idx = this.indexOf(model);
      var prev = this.at(idx - 1);
      var next = this.at(idx + 1);
      if(next) {
        model.set('prevTrip', next.get('id'));
      }
      if(prev) {
        model.set('nextTrip', prev.get('id'));
      }
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
