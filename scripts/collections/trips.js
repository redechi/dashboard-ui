define([
  'backbone',
  'communicator',
  'models/trip',
  './filters'
],
function( Backbone, coms, Trip, filterCollection) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.AML.Collection.extend({

    page: 0,
    model: Trip,
    name: 'default_collection',
    url: 'https://api.automatic.com/v1/trips',

    initialize: function() {
      console.log('initialize a Trips collection');
      this.on('add', this.convertToLinkedList, this);
      this.on('sync', this.applyAllFilters, this);
      this.on('reset', this.applyAllFilters, this);

      coms.on('filter:applyAllFilters', _.bind(this.applyAllFilters, this));
    },

    /*
     *
     * creates an array of trips to update and triggers a reset.
     *
     */
    applyAllFilters: function () {
      console.log('Apply All Filters');
      var self = this;

      //first, apply date filter
      var tripsToInclude = this.applyFilter('date', tripsCollection);

      //then apply remaining filters
      filterCollection.each(function(filter) {
        if(filter.get('name') === 'date') { return; }
        if(filter.get('name') === 'vehicle' && filter.get('value') === 'all') { return; }

        tripsToInclude = self.applyFilter(filter.get('name'), tripsToInclude);
      });

      coms.trigger('filter', tripsToInclude);
    },

    applyFilter: function (name, trips) {
      var tripsCollection = this,
          filter = filterCollection.findWhere({name: name});

      if(!filter) {
        return trips;
      } else {
        return trips.filter(function(trip) { return filter.applyTo(trip); });
      }
    },


    /*
     *
     * recursively fetches pages of trips until one returns empty.
     *
     */
    fetchAll: function () {
      this.fetchPage();
    },


    /*
     *
     * fetches the next page of data and appends it to the collection
     *
     */
    fetchPage: function() {
      var self = this;
      this.page++;
      return this.fetch({add: true, remove: false, data: { page: this.page, per_page: 100}}).always(function(data) {
        if(!!data[0]  || (data && data.statusText === 'cached')) {
          return self.fetchPage();
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
