define([
  'backbone',
  './controllers/router',
  './controllers/login'
],function ( backbone, router, login ) {
  'use strict';

  var Router = backbone.Marionette.AppRouter.extend({

    initialize: function() {
      window.addEventListener('hashchange', this.trackPageview, false);
    },


    appRoutes: {
      '(/)': 'showSummaryLayout',
      'login': 'showLoginLayout',
      'reset': 'showPasswordResetLayout',
      'reset/:token': 'showPasswordResetLayout',
      'filter(/)?:filters': 'showSummaryLayout',
      'logout': 'logOut',
      '*notFound': 'notFound'
    },
    

    route: function(route, name, callback) {
        var router = this;
        if (!callback) callback = this[name];

        var f = function() {

          //check for access tokens on all routes, except login
          if(route !== 'login' && route !== 'reset'  && route !== 'reset/:token') {
            var accessToken = sessionStorage.getItem('accessToken');

            // if no access token, redirect to login
            if(!accessToken) {
              Backbone.history.navigate('/login', {trigger: true});
              return;
            } else {
              login.login();
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
      var gaFragment = Backbone.history.getFragment();

      //only track if changed.
      if(this.gaFragment === gaFragment) {
        return;
      }

      this.gaFragment = gaFragment;

      //prepend slash
      if (!/^\//.test(gaFragment) && gaFragment !== '') {
        gaFragment = '/' + gaFragment;
      }

      var ga;
      if (window.GoogleAnalyticsObject && window.GoogleAnalyticsObject !== 'ga') {
        ga = window.GoogleAnalyticsObject;
      } else {
        ga = window.ga;
      }

      if (typeof ga !== 'undefined') {
        ga('send', 'pageview', gaFragment);
      }
    },


    controller: router
  });

  return new Router();
});
