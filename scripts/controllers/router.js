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
      if (!tripsCollection.models[0]) {
        tripsCollection.once('fetchComplete', function () {
          var summary = new SummaryLayout();
          var contentRegion = regionManager.getRegion('main_content');
          contentRegion.show(summary);
          tripsCollection.applyAllFilters();
        });
      } else {
        var summary = new SummaryLayout();
        var contentRegion = regionManager.getRegion('main_content');
        contentRegion.show(summary);
        tripsCollection.applyAllFilters();
      }
    },


    showTripLayout: function (tripid) {
      var tripArray = tripsCollection.where({id: tripid}),
          tripCollection = new Backbone.Collection(tripArray);

      var trip = new TripLayout({collection: tripCollection});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
    },


    applyFilters: function () {
      filtersCollection.fromUrl();
      this.showSummaryLayout();
    }


  };
});
