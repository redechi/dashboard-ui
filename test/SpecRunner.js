require.config({
    baseUrl: 'spec/../../scripts',
    urlArgs: 'cb=' + Math.random(),

    deps: ['backbone.marionette'],

    paths: {
        spec: 'spec', // lives in the test directory

        jquery: 'base/../..bower_components/jquery/jquery',
        backbone: 'base/../../bower_components/backbone-amd/backbone',
        underscore: 'base/../../bower_components/underscore-amd/underscore',

        /* backbone plugins */
        'backbone.syphon': 'base/../../bower_components/backbone.syphon/lib/amd/backbone.syphon',
        'backbone.iobind': 'base/../../bower_components/backbone.iobind/dist/backbone.iobind',

        /* alias all marionette libs */
        'backbone.marionette': 'base/../../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
        'backbone.wreqr': 'base/../../bower_components/backbone.wreqr/lib/amd/backbone.wreqr', 
        'backbone.babysitter': 'base/../../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',

        /* alias the bootstrap js lib */
        bootstrap: 'vendor/bootstrap',
        'bootstrap-button': 'vendor/bootstrap-button',

        /* Alias text.js for template loading and shortcut the templates dir to tmpl */
        text: 'base/../../bower_components/requirejs-text/text',
        tmpl: 'templates',

        /* handlebars from the require handlerbars plugin below */
        handlebars: 'base/../../bower_components/require-handlebars-plugin/Handlebars',

        /* require handlebars plugin - Alex Sexton */
        i18nprecompile: 'base/../../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
        json2: 'base/../../bower_components/require-handlebars-plugin/hbs/json2',
        hbs: 'base/../../bower_components/require-handlebars-plugin/hbs'
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
  

