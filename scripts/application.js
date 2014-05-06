define([
  'backbone',
  'communicator',
  'jquery',
  'views/collection/trips'
],

function( Backbone, Communicator, $, Trips ) {
  'use strict';

  $.ajaxSetup({headers: {'Authorization': 'token e1f23342e6eb4bbc766692c0da0af23fdc39536b'}})


  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({});

  /* Add initializers here */
  App.addInitializer( function () {
    var trips = new Trips({el: '#content'});
  });

  return App;
});
