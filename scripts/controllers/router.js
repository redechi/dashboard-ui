define([
  'backbone',
  'regionManager',
  '../collections/trips',
  '../views/layout/summary',
  '../views/layout/trip'
],
function( Backbone, regionManager, trips, SummaryLayout, TripLayout) {
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
      var tripModel = trips.where({id:tripid});

    //  if(!tripModel[0]) return // protection clause

      var trip = new TripLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
    }


  };
});
