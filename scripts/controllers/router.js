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

  var contentRegion = regionManager.getRegion('main_content');
  window.TripView = TripLayout;
  window.region = contentRegion;

  return {


    showSummaryLayout: function () {
      // render summary on load
      filtersCollection.fromUrl();
      var summary = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(summary);
      var dateFilter = filtersCollection.findWhere({name: 'date'});
     // if (!dateFilter) filtersCollection.addDateFilter();
      tripsCollection.applyAllFilters();
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
    }


  };
});
