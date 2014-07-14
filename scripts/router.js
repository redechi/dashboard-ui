define([
  'backbone',
  './controllers/router',
  './controllers/login'
],function (backbone, router, login) {
  'use strict';

  var Router = backbone.Marionette.AppRouter.extend({

    appRoutes: {
      '(/)': 'showSummaryLayout',
      'login': 'showLoginLayout',
      'trip/:tripid': 'showTripLayout',
      'filter(/)?:filters': 'applyFilters',
      'logout': 'logOut'
    },

    route: function(route, name, callback) {
        var router = this;
        if (!callback) callback = this[name];

        var f = function() {

          //check for access tokens on all routes, except login
          if(route !== 'login') {
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


    controller: router
  });

  return new Router();
});
