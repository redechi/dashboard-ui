define([
  'backbone',
  'communicator',
  'moment',
  'models/trip',
  'controllers/unit_formatters',
  './filters',
  '../models/settings',
  '../controllers/cache'
],
function( Backbone, coms, moment, Trip, formatters, filterCollection, settings, cache ) {
  'use strict';

  var initUrl = settings.get('api_host') + '/trip/';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    model: Trip,
    startDate: moment().endOf('day').valueOf(),
    url: initUrl,

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
            var min = moment(lastTrip.get('started_at')).startOf('day').valueOf();

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
          var name = filter.get('name');
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
      searchTrip.set('started_at', date);
      //binary search since trips are already sorted by date
      return _.sortedIndex(trips, searchTrip, function(trip) {
        return -trip.get('started_at');
      });
    },


    applyDateFilter: function() {
      var dateFilter = filterCollection.findWhere({name: 'date'}),
          start = this.findSortedIndexByDate(this.models, dateFilter.get('value')[0]),
          end = this.findSortedIndexByDate(this.models, dateFilter.get('value')[1]);

      //Trips are in reverse chronological order
      return this.slice(end, start);
    },


    makeTripsRecent: function(trips) {
      var firstTrip = trips[0],
          offset = moment().diff(moment(firstTrip.started_at)),
          dayOffset = moment.duration(Math.floor(moment.duration(offset).asDays()), 'days');

      return trips.map(function(trip) {
        trip.started_at = moment(trip.started_at).add(dayOffset, 'days');
        trip.ended_at = moment(trip.ended_at).add(dayOffset, 'days');
        return trip;
      });
    },


    prepareDemoTrips: function(response) {
      response.results = this.makeTripsRecent(response.results.map(function(trip) {
        trip.average_kmpl = (trip.distance_m / 1000) / trip.fuel_volume_l;
        return trip;
      }));
      return response;
    },


    fetchDemoTrips: function() {
      var self = this;
      $.getJSON('./assets/data/trips.json', function(results) {
        self.set(self.parse(self.prepareDemoTrips(results)));
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
            end = moment().valueOf(),
            trips = cache.fetch('trips');

        if(trips && trips.length) {
          var startDate = sessionStorage.getItem('tripsStart');
          if(startDate) {
            this.startDate = startDate;
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
      // api expects epoch time in seconds, hence dividing by 1000
      var self = this;
      var limit = 250;
      var params = {
            limit: limit,
            started_at__gte: (start / 1000) || undefined,
            ended_at__lte: (end / 1000) || undefined,
            page: page || 1
          };

      return this.fetch({
        remove: false,
        data: params,
        error: settings.fetchErrorHandler
      }).always(function(data) {
        coms.trigger('overlay:page', self.length);

        if(data && data._metadata && data._metadata.next) {
          //User has another page of trips
          return self.fetchPage(start, end, params.page + 1);
        } else {

          // setting start date is important to see how far back we've looked for trips
          self.startDate = start;

          cache.save('trips', self.toJSON());
          cache.save('tripsStart', self.startDate);

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


    parse: function(response) {
      return _.map(response.results, function(trip){
        var vehicleUrl = trip.vehicle.split('/');
        trip.vehicle_id = vehicleUrl[vehicleUrl.length - 2];
        trip.started_at = moment(trip.started_at).valueOf();
        trip.ended_at = moment(trip.ended_at).valueOf();
        trip.average_mpg = formatters.kmplToMpg(trip.average_kmpl);
        trip.fuel_volume_gal = formatters.litersToGal(trip.fuel_volume_l);
        return trip;
      });
    },


    checkForNoTrips: function() {
      this.fetch({
        remove: false,
        data: { limit: 1 },
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
