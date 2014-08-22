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

    model: Trip,
    startDate: moment().endOf('day').valueOf(),
    url: login.getAPIUrl() + '/v1/trips',

    initialize: function() {
      coms.on('filter:applyAllFilters', _.bind(this.applyAllFilters, this));
    },


    applyAllFilters: function () {
      var dateFilter = filterCollection.findWhere({name: 'date'}),
          start = dateFilter.get('value')[0],
          end = dateFilter.get('value')[1];

      if(start < this.startDate) {
        this.fetchPage(start, this.startDate);
      } else {

        //if date Filter = allTime, set date min
        if(dateFilter.get('valueSelected') === 'allTime') {
          var min = moment(this.last().get('start_time')).startOf('day').valueOf();
          dateFilter.set({
            min: min,
            value: [min, end]
          });
        }

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
      }
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


    fetchPlaygroundTrips: function() {
      var self = this;
      $.getJSON('./assets/data/playground.json', function(trips) {
        self.set(trips);
        coms.trigger('filter:applyAllFilters');
      });
    },


    fetchAll: function () {
      if(login.isPlayground()) {
        //get trips from local JSON
        this.fetchPlaygroundTrips();
      } else {
        var dateFilter = filterCollection.findWhere({name: 'date'}),
            start = dateFilter.get('value')[0],
            end = moment().valueOf();

        var trips = this.fetchFromSessionStorage();
        if(trips && trips.length) {
          this.set(trips);
          coms.trigger('filter:applyAllFilters');
        } else {
          this.fetchPage(start, end);
        }
      }
    },


    fetchPage: function(start, end, page) {
      var self = this,
          per_page = 100;

      if(page === undefined) {
        page = 1;
      }
      return this.fetch({
        remove: false,
        data: {
          page: page,
          per_page: per_page,
          start: start,
          end: end
        },
        error: login.fetchErrorHandler
      }).always(function(data) {
        coms.trigger('overlay:page', self.length);
        if(data.length === per_page) {
          //User has another page of trips
          return self.fetchPage(start, end, (page + 1));
        } else {
          self.startDate = Math.min(start, self.startDate);
          self.saveToSessionStorage();

          if(!self.length) {
          }

          coms.trigger('filter:applyAllFilters');
        }
      });
    },



    saveToSessionStorage: function() {
      sessionStorage.setItem('trips', JSON.stringify(this.toJSON()));
      sessionStorage.setItem('tripsStart', this.startDate);
    },


    fetchFromSessionStorage: function () {
      var start = sessionStorage.getItem('tripsStart');
      if(start) {
        this.startDate = start;
      }
      return JSON.parse(sessionStorage.getItem('trips'));
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
          }
        };
      }, memo);
    }
  });

  // make this a singleton
  return new Trips();
});
