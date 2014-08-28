define([
  'backbone',
  'communicator',
  'regionManager',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/login',
  '../views/layout/password_reset'
],
function( Backbone, coms, regionManager, filtersCollection, SummaryLayout, LoginLayout, PasswordResetLayout ) {
  'use strict';

  return {

    showSummaryLayout: function () {
      var layout = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      filtersCollection.fromUrl();
      contentRegion.show(layout);
    },


    showLoginLayout: function () {
      var layout = new LoginLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showPasswordResetLayout: function (token) {
      var layout = new PasswordResetLayout({token: token});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    logOut: function () {
      sessionStorage.clear();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      coms.trigger('overlay:hide');
      window.location = '#login';
    },


    notFound: function () {
      window.location = '/';
    }

  };
});
