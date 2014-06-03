require.config({

  /* starting point for application */
  deps: ['amlCollection', 'd3', 'nvd3', 'mapbox', 'backbone.marionette', 'bootstrap', 'main'],


  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },

    bootstrapSlider: {
        deps: ['jquery'],
        exports: 'jquery'
    },

    bootstrap: {
        deps: ['jquery', 'bootstrapSlider'],
        exports: 'jquery'
    },

    nvd3: {
      deps: ['d3'],
      exports: 'nvd3'
    }
  },

  paths: {
    amlCollection: 'base/collection',
    amlAggregate: 'controllers/aggregate',
    amlSort: 'controllers/sort',


    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',

    moment: '../bower_components/momentjs/moment',
    d3: '../bower_components/d3/d3',
    nvd3: '../assets/js/nv.d3.min',

    mapbox: 'http://api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox',

    /* alias all marionette libs */
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',

    /* alias the bootstrap js lib */
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
    bootstrapSlider: '../bower_components/seiyria-bootstrap-slider/js/bootstrap-slider',

    /* Alias text.js for template loading and shortcut the templates dir to tmpl */
    text: '../bower_components/requirejs-text/text',
    tmpl: "../templates",

    /* handlebars from the require handlerbars plugin below */
    handlebars: '../bower_components/require-handlebars-plugin/Handlebars',

    /* require handlebars plugin - Alex Sexton */
    i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
    json2: '../bower_components/require-handlebars-plugin/hbs/json2',
    hbs: '../bower_components/require-handlebars-plugin/hbs'
  },

  hbs: {
    disableI18n: true
  }
});
