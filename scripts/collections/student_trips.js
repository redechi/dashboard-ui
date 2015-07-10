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
function(Backbone, coms, moment, Trip, formatters, filterCollection, settings, cache) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    model: Trip,


    url: function() {
      return settings.get('licenseplus_api_host') + '/user/' + this.student_id + '/trip/';
    },


    fetchInitial: function () {
      var trips = cache.fetch('studentTrips');
      if(trips && trips.length) {
        this.set(trips);
      } else {
        this.fetchPage();
      }
    },


    fetchPage: function(page) {
      var self = this,
          limit = 250,
          params = {
            limit: limit,
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
          return self.fetchPage(params.page + 1);
        } else {
          cache.save('studentTrips', self.toJSON());
          self.trigger('reset');
        }
      });
    },


    parse: function(response) {
      return _.map(response.results, function(trip){
        trip.started_at = moment(trip.started_at).valueOf();
        trip.ended_at = moment(trip.ended_at).valueOf();
        trip.average_mpg = formatters.kmplToMpg(trip.average_kmpl);
        trip.fuel_volume_gal = formatters.litersToGal(trip.fuel_volume_l);
        return trip;
      });
    }
  });

  // make this a singleton
  return new Trips();
});
