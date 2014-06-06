define([
  'backbone',
  'regionManager',
  '../collections/trips',
  '../views/layout/summary',
  '../views/layout/trip'
],
function( Backbone, regionManager, tripsCollection, SummaryLayout, TripLayout) {
  'use strict';

  var contentRegion = regionManager.getRegion('main_content');
  window.TripView = TripLayout;
  window.region = contentRegion;

  return {


    showSummaryLayout: function () {
      // render summary on load
      var summary = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(summary);
    },


    showTripLayout: function (tripid) {
      var tripArray = tripsCollection.where({id: tripid}),
          tripCollection = new Backbone.Collection(tripArray);

    //  if(!tripModel[0]) return // protection clause

      var trip = new TripLayout({collection: tripCollection});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
    },


    applyFilters: function (filtersString) {
    }


  };
});
