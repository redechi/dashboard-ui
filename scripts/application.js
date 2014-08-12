define([
  'backbone',
  'router',
  'regionManager',
  './controllers/login',
  './collections/trips',
  './views/layout/overlay'
],

function( Backbone, router, regionManager, login, tripsCollection, OverlayLayout ) {
  'use strict';


  window.options = {};

  //Log the user in if access token present
  login.login();

  //only allow one popover at a time, close popovers when a user clicks off
  $('body').on('click', function(e) {
    $('[data-toggle="popover"]').each(function() {
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        // allow clicking on datepicker
        if($('.datepicker').has(e.target).length === 0 && !$(e.target).is('.datepicker')) {
          $(this).popover('hide');
        }
      }
    });
  });

  //format for moment's calendar method
  moment.lang('en', {
    calendar : {
      lastDay : '[Yesterday]',
      sameDay : '[Today]',
      nextDay : '[Tomorrow]',
      lastWeek : 'MMM DD',
      nextWeek : 'MMM DD',
      sameElse : 'MMM DD'
    }
  });


  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({
    headerRegion: "header.mainHeader",
    contentRegion: "main",
    overlayRegion: "#overlay"
  });


  App.addInitializer( function () {
    //check for browser compatibility
    if((Modernizr && !Modernizr.svg) || window.location.search.indexOf('unsupported') !== -1) {
      var overlayRegion = regionManager.getRegion('main_overlay');
      var o = new OverlayLayout({type: 'notSupported'});
      overlayRegion.show(o);
    }

    //show staging banner, if on staging
    if(login.isStaging()) {
      $('#staging').show();
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
  regionManager.addRegion('main_overlay', App.overlayRegion);

  return App;
});
