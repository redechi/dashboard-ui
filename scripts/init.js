require.config({

  /* starting point for application */
  deps: ['d3', 'nvd3', 'moment', 'backbone.marionette', 'bootstrap', 'main', 'jquery.scrollTo'],


  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },

    bootstrapSlider: ['jquery'],

    bootstrapDatepicker: ['jquery'],

    bootstrap: ['jquery', 'bootstrapSlider', 'bootstrapDatepicker'],

    nvd3: {
      deps: ['d3'],
      exports: 'nvd3'
    }
  },

  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    'jquery.scrollTo': '../bower_components/jquery.scrollTo/jquery.scrollTo',
    'mobile-detect': '../bower_components/mobile-detect/mobile-detect',

    moment: '../bower_components/momentjs/moment',
    d3: '../bower_components/d3/d3',
    nvd3: '../bower_components/nvd3/nv.d3',
    mapbox: '../bower_components/mapbox.js/index',

    fileSaver: '../bower_components/FileSaver/FileSaver',

    /* alias all marionette libs */
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/backbone.marionette',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/backbone.wreqr',
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/backbone.babysitter',

    /* alias the bootstrap js lib */
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
    bootstrapSlider: '../bower_components/seiyria-bootstrap-slider/js/bootstrap-slider',
    bootstrapDatepicker: '../bower_components/bootstrap-datepicker/js/bootstrap-datepicker',

    /* shortcut the templates dir to tmpl */
    tmpl: '../templates',

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
