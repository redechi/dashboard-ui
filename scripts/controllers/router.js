define([
  'backbone',
  'regionManager',
  '../collections/trips',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/trip',
  '../views/layout/login'
],
function( Backbone, regionManager, tripsCollection, filtersCollection, SummaryLayout, TripLayout, LoginLayout) {
  'use strict';

  window.TripView = TripLayout;

  return {

    showSummaryLayout: function () {
      var summary = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      filtersCollection.fromUrl();
      contentRegion.show(summary);
      tripsCollection.applyAllFilters();
    },

    showLoginLayout: function () {
      var login = new LoginLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(login);
    },


    showTripLayout: function (tripid) {
      var tripArray = tripsCollection.where({id: tripid}),
          tripCollection = new Backbone.Collection(tripArray);

      var trip = new TripLayout({collection: tripCollection});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
    },


    applyFilters: function () {
      this.showSummaryLayout();
    },


    logOut: function () {
      sessionStorage.clear();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location = '/';
    }

  };
});
