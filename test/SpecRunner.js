require.config({
    baseUrl: '/scripts',
    urlArgs: 'cb=' + Math.random(),

    deps: ['backbone.marionette'],

    paths: {
        spec: '../test/spec', // lives in the test directory

        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        'jquery.scrollTo': '../bower_components/jquery.scrollTo/jquery.scrollTo',
        'mobile-detect': '../bower_components/mobile-detect/mobile-detect',

        moment: '../bower_components/momentjs/moment',
        d3: '../bower_components/d3/d3',
        nvd3: '../bower_components/nvd3/nv.d3',
        mapbox: '../bower_components/mapbox.js/mapbox',

        fileSaver: '../bower_components/FileSaver/FileSaver',

        fastclick: '../bower_components/fastclick/lib/fastclick',

        domReady: '../bower_components/domReady/domReady',

        /* alias all marionette libs */
        'backbone.marionette': '../bower_components/backbone.marionette/lib/core/backbone.marionette',
        'backbone.wreqr': '../bower_components/backbone.wreqr/lib/backbone.wreqr',
        'backbone.babysitter': '../bower_components/backbone.babysitter/lib/backbone.babysitter',

        /* alias the bootstrap js lib */
        bootstrap: '../bower_components/bootstrap/js',
        bootstrapSlider: '../bower_components/seiyria-bootstrap-slider/js/bootstrap-slider',
        bootstrapDatetimepicker: '../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',

        /* shortcut the templates dir to tmpl */
        tmpl: '../templates',

        /* handlebars from the require handlerbars plugin below */
        handlebars: '../bower_components/require-handlebars-plugin/Handlebars',

        /* require handlebars plugin - Alex Sexton */
        i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
        json2: '../bower_components/require-handlebars-plugin/hbs/json2',
        hbs: '../bower_components/require-handlebars-plugin/hbs',

        /* Mixpanel */
        mixpanel: '//cdn.mxpnl.com/libs/mixpanel-2.2.min',

        /* Google Analytics */
        ga: '//www.google-analytics.com/analytics'
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
