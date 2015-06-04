define([
  'backbone',
  'communicator',
  'regionManager',
  '../collections/filters',
  '../views/layout/summary',
  '../views/layout/licenseplus',
  '../views/layout/login',
  '../views/layout/coach_login',
  '../views/layout/password_reset',
  '../views/layout/apps',
  '../views/layout/labs',
  '../controllers/login'
],

function( Backbone, coms, regionManager, filtersCollection, SummaryLayout, LicenseplusLayout, LoginLayout, CoachLoginLayout, PasswordResetLayout, AppsLayout, LabsLayout, login ) {
  'use strict';

  return {

    showSummaryLayout: function () {
      var layout = new SummaryLayout();
      var contentRegion = regionManager.getRegion('main_content');
      filtersCollection.fromUrl();
      contentRegion.show(layout);
    },


    showLicensePlusLayout: function () {
      var layout = new LicenseplusLayout();
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showLoginLayout: function (token) {
      var layout = new LoginLayout({token: token});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showCoachLoginLayout: function (token) {
      var layout = new CoachLoginLayout({token: token});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showPasswordResetLayout: function (token) {
      var layout = new PasswordResetLayout({token: token});
      var contentRegion = regionManager.getRegion('main_content');
      contentRegion.show(layout);
    },


    showAppsLayout: function (token) {
      var layout = new AppsLayout({token: token});
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
