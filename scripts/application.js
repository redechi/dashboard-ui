define([
  'backbone',
  'router',
  'regionManager',
  './controllers/login',
  './collections/trips'
],

function( Backbone, router, regionManager, login, tripsCollection ) {
  'use strict';

  //Log the user in if access token present
  login.login();

  //only allow one popover at a time, close popovers when a user clicks off
  $('body').on('click', function(e) {
    $('[data-toggle="popover"]').each(function() {
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        //allow clicking on datepicker
        if(!$(e.target).is('.day, .month, .year, .prev, .next')) {
          $(this).popover('hide');
        }
      }
    });
  });


  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({
    headerRegion: "header.mainHeader",
    contentRegion: "main",
    footerRegion: "footer",
    overlayRegion: "#overlay"
  });


  App.addInitializer( function () {
    //check for browser compatibility
    if(Modernizr && !Modernizr.svg) {
    }
  });


  App.on("start", function(){
    console.log('Start History');
    Backbone.history.previous = [];
    Backbone.history.next = [];
    Backbone.history.start();
  });

  // save regions
  regionManager.addRegion('main_content', App.contentRegion);
  regionManager.addRegion('main_header', App.headerRegion);
  regionManager.addRegion('main_footer', App.footerRegion);
  regionManager.addRegion('main_overlay', App.overlayRegion);

  return App;
});
