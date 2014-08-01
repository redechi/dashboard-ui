define([
  'backbone',
  'regionManager',
  '../collections/trips',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/trip',
  '../views/layout/login',
  '../views/layout/password_reset'
],
function( Backbone, regionManager, tripsCollection, filtersCollection, SummaryLayout, TripLayout, LoginLayout, PasswordResetLayout ) {
  'use strict';

  return {

    showSummaryLayout: function () {
      var summary = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      filtersCollection.fromUrl();
      contentRegion.show(summary);
    },


    showLoginLayout: function () {
      var login = new LoginLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(login);
    },


    showPasswordResetLayout: function (token) {
      var passwordReset = new PasswordResetLayout({token: token});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(passwordReset);
    },


    showTripLayout: function (tripid) {
      var tripArray = tripsCollection.where({id: tripid}),
          tripCollection = new Backbone.Collection(tripArray);

      var trip = new TripLayout({collection: tripCollection});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(trip);
    },


    logOut: function () {
      sessionStorage.clear();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location = '/';
    },


    notFound: function () {
      window.location = '/';
    }

  };
});
