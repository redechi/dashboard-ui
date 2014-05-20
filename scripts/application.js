define([
  'backbone',
  'communicator',
  'jquery',
  'views/layout/summary'
],

function( Backbone, Communicator, $, Summary ) {
  'use strict';

  $.ajaxSetup({headers: {'Authorization': 'token e1f23342e6eb4bbc766692c0da0af23fdc39536b'}})


  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({
    contentRegion: "#content"
  });

  /* Add initializers here */
  App.addInitializer( function () {
    // render summary on load
    var summary = new Summary();
    this.contentRegion.show(summary);
  });

  return App;
});
