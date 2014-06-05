define([
  'backbone',
  './controllers/router'
],function (backbone, controller) {
  'use strict';

  var Router = backbone.Marionette.AppRouter.extend({

    appRoutes: {
      '': 'showSummaryView',
      'trip/:tripid'      : 'showTripView'
    },

    controller: controller
  });

  return new Router();
});
