define([
  'backbone',
  'communicator',
  'regionManager',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/login',
  '../views/layout/password_reset',
  '../views/layout/apps',
  '../views/layout/labs',
  '../controllers/login'
],

function( Backbone, coms, regionManager, filtersCollection, SummaryLayout, LoginLayout, PasswordResetLayout, AppsLayout, LabsLayout, login ) {
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


    showPasswordResetLayout: function () {
      var layout = new PasswordResetLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showAppsLayout: function () {
      var layout = new AppsLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showLabsLayout: function() {
      var layout = new LabsLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    logout: function () {
      login.logout();
      coms.trigger('overlay:destroy');
      window.location = (login.isUsingStaging()) ? '/?staging' : '/';
    },


    notFound: function () {
      window.location = '/';
    }

  };
});
