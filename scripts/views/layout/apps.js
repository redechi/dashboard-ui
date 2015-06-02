define([
  'backbone',
  'regionManager',
  '../composite/apps',
  'hbs!tmpl/layout/connected_apps_tmpl',
  '../../collections/apps',
  '../item/header',
  '../../controllers/login'
],

function( Backbone, regionManager, AppsView, AuthorizedAppsTmpl, apps, HeaderView, login ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      this.collection.fetch();
    },


    template: AuthorizedAppsTmpl,
    collection: apps,


    regions: {
      apps: '#apps'
    },


    className: 'apps',


    onRender: function() {
      var appsView = new AppsView();
      this.apps.show(appsView);

      regionManager.getRegion('main_header').show(new HeaderView({attributes: {
        loggedIn: login.isLoggedIn
      }}));
    },

    onShow: function() {
    }
  });
});
