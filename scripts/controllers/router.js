define([
  'regionManager',
  '../views/layout/summary',
  '../views/layout/trip'
],
function(regionManager, SummaryView, TripView) {
  'use strict';

  return {


    showSummaryView: function () {
      // render summary on load
      var summary = new SummaryView();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(summary);
    },


    showTripView: function (tripid) {
      'use strict';
      var t = new TripView();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.close();
      contentRegion.show(t);
      console.log(contentRegion)
      window.TripView = TripView
      window.region = contentRegion
    }
  }
});
