require.config({
    baseUrl: '/scripts',
    urlArgs: 'cb=' + Math.random(),

    deps: ['backbone.marionette'],

    paths: {
        spec: '../test/spec', // lives in the test directory
        amlCollection: 'base/collection',

        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',

        moment: '../bower_components/momentjs/moment',
        d3: '../bower_components/d3/d3',
        nvd3: '../bower_components/nvd3/nv.d3',
        mapbox: '//api.tiles.mapbox.com/mapbox.js/v1.6.3/mapbox',
        markercluster: '//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster',


        /* alias all marionette libs */
        'backbone.marionette': '../bower_components/backbone.marionette/lib/core/backbone.marionette',
        'backbone.wreqr': '../bower_components/backbone.wreqr/lib/backbone.wreqr',
        'backbone.babysitter': '../bower_components/backbone.babysitter/lib/backbone.babysitter',

        /* alias the bootstrap js lib */
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',

        /* Alias text.js for template loading and shortcut the templates dir to tmpl */
        text: '../bower_components/requirejs-text/text',
        tmpl: '../templates',

        /* handlebars from the require handlerbars plugin below */
        handlebars: '../bower_components/require-handlebars-plugin/hbs/handlebars',

        /* require handlebars plugin - Alex Sexton */
        i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
        json2: '../bower_components/require-handlebars-plugin/hbs/json2',
        hbs: '../bower_components/require-handlebars-plugin/hbs'
    },

    hbs: {
        disableI18n: true
    }
});

/* require test suite */
require([
    'jquery',
    'spec/testSuite'
],
function( $, testSuite ) {
  'use strict';

  /* on dom ready require all specs and run */
  $( function() {
    require(testSuite.specs, function() {
      if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
      }
      else {
        mocha.run();
      }
    });
  });
});
