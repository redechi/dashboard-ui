define([
  'regionManager',
  '../views/layout/trip'
],
function(regionManager, TripView) {
  'use strict';

  console.log('app')
  return {
    showTripView: function (tripid) {
      'use strict';
      var t = new TripView();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.close();
      contentRegion.show(t);
    }
  }
});
