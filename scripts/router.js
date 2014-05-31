define([
  'backbone',
  './controllers/router'
  ],function (backbone, controller) {
    'use strict';

    var Router = backbone.Marionette.AppRouter.extend({

        appRoutes: {
            'test/:what'      : 'test'
        },

        controller: controller

    });

    var r = new Router();
    return r;
});
