define([
  'backbone',
  './controllers/router',
  './controllers/login',
  './controllers/analytics'
],function ( backbone, router, login, analytics ) {
  'use strict';

  var Router = backbone.Marionette.AppRouter.extend({

    initialize: function() {
      window.addEventListener('hashchange', _.bind(this.trackPageview, this), false);
    },


    appRoutes: {
      '(/)': 'showSummaryLayout',
      'login(/:token)': 'showLoginLayout',
      'reset(/:token)': 'showPasswordResetLayout',
      'filter(/)(?:filters)': 'showSummaryLayout',
      'licenseplus': 'showLicensePlusLayout',
      'logout': 'logout',
      'coach_login(/:token)': 'showCoachLoginLayout',
      '*notFound': 'notFound'
    },


    route: function(route, name, callback) {
        var router = this;
        if (!callback) callback = this[name];

        var f = function() {
          //check for access tokens on all routes, except login, coach_login, password reset and demo
          if(!/^login|^reset\/?.+|^coach_login\/?.+/.test(route) && !login.isDemo()) {
            var accessToken = sessionStorage.getItem('accessToken');

            // if no access token, redirect to login
            if(!accessToken) {
              Backbone.history.navigate('/login', {trigger: true, replace: true});
              return;
            } else {
              login.setAccessToken();
            }
          }

          callback.apply(router, arguments);
        };
        return Backbone.Router.prototype.route.call(this, route, name, f);
    },


    onRoute: function() {
      //track every route change as a page view in google analytics
      this.trackPageview();
    },


    trackPageview: function () {
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
