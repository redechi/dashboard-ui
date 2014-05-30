define([
  'backbone',
  'communicator',
  'jquery',
  'views/layout/summary',
  'router'
],

function( Backbone, Communicator, $, Summary, router ) {
  'use strict';

  // simple session storage
  $.ajaxSetup({
    headers: {'Authorization': 'token 31b5d336c4c4166606d91c4533c8da763996a02b'},
    beforeSend: function (xhr, req) {
      try {
        // TODO: invalidate cache at 15 min.
        var obj = JSON.parse(sessionStorage.getItem(req.url) || '');
        this.success(obj);
        xhr.abort();
      } catch (e) {
        console.warn('Request Not Cached: ' + req.url);
      }
    },
    complete: function(xhr, status) {
      try {
        console.log('Caching Request: ' + this.url);
        sessionStorage.setItem(this.url, xhr.responseText);
      } catch (e) {
        console.warn('Could Not Cache: ' + req.url);
      }
    }
  })


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

  // contextual startup
  App.on("initialize:after", function(){
    console.log('Start History')
    Backbone.history.start();
  });

  return App;
});
