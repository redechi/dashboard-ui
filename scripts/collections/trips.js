define([
  'backbone',
  'communicator',
  'models/trip',
  './filters',
  '../controllers/login'
],
function( Backbone, coms, Trip, filterCollection, login ) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    page: 0,
    per_page: 100,
    model: Trip,
    name: 'default_collection',
    url: login.getAPIUrl() + '/v1/trips',

    initialize: function() {
      coms.on('filter:applyAllFilters', _.bind(this.applyAllFilters, this));
    },


    applyAllFilters: function () {
      //first, apply date filter
      var filteredTrips = this.applyDateFilter();

      //then apply remaining filters
      filterCollection.each(function(filter) {
        var name = filter.get('name')
        if(name === 'date' || (name === 'vehicle' && filter.get('value') === 'all')) {
          return;
        }

        filteredTrips = filteredTrips.filter(function(trip) { return filter.applyTo(trip); });
      });

      coms.trigger('filter', filteredTrips);
    },


    findSortedIndexByDate: function(trips, date) {
      var searchTrip = new Trip;
      searchTrip.set('start_time', date);
      //binary search since trips are already sorted by date
      return _.sortedIndex(trips, searchTrip, function(trip) {
        return -trip.get('start_time');
      });
    },


    applyDateFilter: function() {
      var dateFilter = filterCollection.findWhere({name: 'date'}),
          start = this.findSortedIndexByDate(this.models, dateFilter.get('value')[0]),
          end = this.findSortedIndexByDate(this.models, dateFilter.get('value')[1]);

      //Trips are in reverse chronological order
      return this.slice(end, start);
    },


    fetchFromSessionStorage: function () {
      return JSON.parse(sessionStorage.getItem('trips'));
    },


    fetchAll: function () {
      var trips = this.fetchFromSessionStorage();

      if(!trips) {
        this.fetchPage();
      } else {
        this.set(trips);
        coms.trigger('filter:applyAllFilters');
      }
    },


    fetchPage: function() {
      var self = this;

      this.page++;
      return this.fetch({
        remove: false,
        data: {
          page: this.page,
          per_page: this.per_page
        },
        error: login.fetchErrorHandler
      }).always(function(data) {
        if(self.page == 1 && data && data.length == 0) {
          //User has no trips
          coms.trigger('error:noTrips');
        } else if(data && data.length) {
          coms.trigger('overlay:page', self.length);
          if(data.length === self.per_page) {
            //User has another page of trips
            return self.fetchPage();
          } else {
            self.saveToSessionStorage();
            coms.trigger('filter:applyAllFilters');
          }
        }
      });
    },


    saveToSessionStorage: function() {
      sessionStorage.setItem('trips', JSON.stringify(this.toJSON()));
    },


    calculateRanges: function() {
      var memo = {
        distance: {min: Infinity, max: 0},
        duration: {min: Infinity, max: 0},
        cost: {min: Infinity, max: 0},
        date: {min: Infinity}
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
          date: {
            min: Math.max(Math.min(trip.get('start_time'), memo.date.min), 1363071600000)
          }
        };
      }, memo);
    }
  });

  // make this a singleton
  return new Trips();
});
