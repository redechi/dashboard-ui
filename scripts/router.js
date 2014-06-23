define([
  'backbone',
  './controllers/router'
],function (backbone, controller) {
  'use strict';

  var Router = backbone.Marionette.AppRouter.extend({

    appRoutes: {
      '(/)': 'showSummaryLayout',
      'trip/:tripid': 'showTripLayout',
      'filter(/)?:filters': 'applyFilters',
      'logout': 'logOut'
    },

    controller: controller
  });

  return new Router();
});
