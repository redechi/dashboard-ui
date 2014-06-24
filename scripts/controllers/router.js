define([
  'backbone',
  'regionManager',
  '../collections/trips',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/trip'
],
function( Backbone, regionManager, tripsCollection, filtersCollection, SummaryLayout, TripLayout) {
  'use strict';

  var currentView = undefined;

  var contentRegion = regionManager.getRegion('main_content');
  window.TripView = TripLayout;
  window.region = contentRegion;

  return {


    showSummaryLayout: function () {

      filtersCollection.fromUrl();
      var dateFilter = filtersCollection.findWhere({name: 'date'});
      if (!dateFilter) filtersCollection.addDateFilter();
      tripsCollection.applyAllFilters();

      var contentRegion = regionManager.getRegion('main_content');
      if (currentView !== 'summary') {
        var summary = new SummaryLayout();
        contentRegion.show(summary);
      }

      currentView = 'summary';
    },


    showTripLayout: function (tripid) {
      var tripArray = tripsCollection.where({id: tripid}),
          tripCollection = new Backbone.Collection(tripArray);

      var trip = new TripLayout({collection: tripCollection});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
      currentView = 'trip_layout';
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
