define([
  'backbone',
  'communicator',
  'models/trip',
  './filters',
  '../models/settings',
  '../controllers/cache'
],
function( Backbone, coms, Trip, filterCollection, settings, cache ) {
  'use strict';

  /* trips singleton */
  var Trips = Backbone.Collection.extend({

    model: Trip,


    url: function() {
      return settings.get('newton_host') + '/user/' + this.student_id + '/trip/';
    },


    parse: function(response) {
      return response.results;
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
          per_page = 100;

      if(page === undefined) {
        page = 1;
      }
      return this.fetch({
        remove: false,
        data: {
          page: page
        },
        error: settings.fetchErrorHandler
      }).always(function(data) {
        if(data && data.results && data.results.length === per_page) {
          //User has another page of trips
          return self.fetchPage(page + 1);
        } else {
          cache.save('studentTrips', self.toJSON());
          self.trigger('reset');
        }
      });
    }
  });

  // make this a singleton
  return new Trips();
});
