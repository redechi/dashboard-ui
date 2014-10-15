define([
  'backbone',
  'communicator',
  'moment',
  'models/trip',
  './filters',
  '../models/settings',
  '../controllers/cache'
],
function( Backbone, coms, moment, Trip, filterCollection, settings, cache ) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    model: Trip,
    startDate: moment().endOf('day').valueOf(),
    url: settings.get('api_host') + '/v1/trips',

    initialize: function() {
      coms.on('filter:applyAllFilters', this.applyAllFilters, this);
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
          var lastTrip = this.last();

          if(lastTrip) {
            var min = moment(lastTrip.get('start_time')).startOf('day').valueOf();
            
            dateFilter.set({
              min: min,
              value: [min, end]
            });
          }
        }

        //unselect all trips
        this.deselectAll();

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


    deselectAll: function() {
      this.each(function(trip) {
        trip.set('selected', false);
      });
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


    makeTripsRecent: function (trips) {
      var firstTrip = trips[0],
          offset = moment().diff(moment(firstTrip.start_time)),
          dayOffset = moment.duration(Math.floor(moment.duration(offset).asDays()), 'days');

      return trips.map(function(trip) {
        trip.start_time = trip.start_time + dayOffset;
        trip.end_time = trip.end_time + dayOffset;
        return trip;
      });
    },


    fetchDemoTrips: function() {
      var self = this;
      $.getJSON('./assets/data/trips.json', function(trips) {
        self.set(self.makeTripsRecent(trips));
        self.startDate = 0;
        coms.trigger('filter:applyAllFilters');
      });
    },


    fetchInitial: function () {
      if(settings.isDemo()) {
        //get trips from local JSON
        this.fetchDemoTrips();
      } else {
        var dateFilter = filterCollection.findWhere({name: 'date'}),
            start = dateFilter.get('value')[0],
            end = moment().valueOf();

        var trips = cache.fetch('trips');

        if(trips && trips.length) {
          var start = sessionStorage.getItem('tripsStart');
          if(start) {
            this.startDate = start;
          }

          this.set(trips);
          coms.trigger('filter:checkUnattachedVehicles', this);
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
        error: settings.fetchErrorHandler
      }).always(function(data) {
        coms.trigger('overlay:page', self.length);

        if(data.length === per_page) {
          //User has another page of trips
          return self.fetchPage(start, end, (page + 1));
        } else {
          self.startDate = Math.min(start, self.startDate);

          cache.save('trips', self.toJSON());
          sessionStorage.setItem('tripsStart', self.startDate);

          if(!self.length) {
            self.checkForNoTrips();
          }
          coms.trigger('filter:checkUnattachedVehicles', self);
          coms.trigger('filter:applyAllFilters');
        }
      });
    },


    fetchAll: function() {
      this.fetchPage(0, this.startDate);
    },


    checkForNoTrips: function() {
      this.fetch({
        remove: false,
        data: { per_page: 1 },
        error: settings.fetchErrorHandler
      }).always(function(data) {
        if(data && data.length === 0) {
          //User has no trips at all
          coms.trigger('error:noTrips');
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
          }
        };
      }, memo);
    }
  });

  // make this a singleton
  return new Trips();
});
