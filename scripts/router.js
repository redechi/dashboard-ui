define([
  'backbone',
  './controllers/router',
  './controllers/login',
  './controllers/analytics',
  './controllers/cache'
], function(Backbone, router, login, analytics, cache) {
  'use strict';

  var Router = Backbone.Marionette.AppRouter.extend({

    initialize: function() {
      window.addEventListener('hashchange', _.bind(this.trackPageview, this), false);
    },


    appRoutes: {
      '(/)': 'showSummaryLayout',
      'login': 'showLoginLayout',
      'reset': 'showPasswordResetLayout',
      'filter(/)(?:filters)': 'showSummaryLayout',
      'logout': 'logout',
      'connected_apps': 'showAppsLayout',
      'labs': 'showLabsLayout',
      '*notFound': 'notFound'
    },


    route: function(route, name, callback) {
      var self = this;

      callback = callback || this[name];

      var f = function() {
        //check for access tokens on all routes, except login, password reset and demo
        if(!/^login|^logout|^reset/.test(route) && !login.isDemo()) {
          var accessToken = sessionStorage.getItem('accessToken');

          // if no access token, redirect to login
          if(!accessToken) {
            Backbone.history.navigate('/login', {trigger: true, replace: true});
            return;
          } else {
            login.setAccessToken();
          }
        }

        callback.apply(self, arguments);
      };
      return Backbone.Router.prototype.route.call(this, route, name, f);
    },


    onRoute: function() {
      //track every route change as a page view in google analytics
      this.trackPageview();
    },


    trackPageview: function() {
      var urlFragment = Backbone.history.getFragment();

      //prepend slash
      if (!/^\//.test(urlFragment) && urlFragment !== '') {
        urlFragment = '/' + urlFragment;
      }

      //only track if changed.
      if(this.urlFragment === urlFragment) {
        return;
      }

      this.urlFragment = urlFragment;

      analytics.trackPageview(urlFragment);
    },


    controller: router
  });

  return new Router();
});
