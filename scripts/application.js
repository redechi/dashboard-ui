define([
  'backbone',
  'router',
  'regionManager',
  './controllers/login',
  './collections/trips',
  './views/layout/overlay',
  'mobile-detect'
],

function( Backbone, router, regionManager, login, tripsCollection, OverlayLayout, MobileDetect ) {
  'use strict';

  (function( jQuery ) {
    if ( window.XDomainRequest ) {
      jQuery.ajaxTransport(function( s ) {
        if ( s.crossDomain && s.async ) {
          if ( s.timeout ) {
            s.xdrTimeout = s.timeout;
            delete s.timeout;
          }
          var xdr;
          return {
            send: function( _, complete ) {
              function callback( status, statusText, responses, responseHeaders ) {
                xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                xdr = undefined;
                complete( status, statusText, responses, responseHeaders );
              }
              xdr = new window.XDomainRequest();
              xdr.onload = function() {
                callback( 200, 'OK', { text: xdr.responseText }, 'Content-Type: ' + xdr.contentType );
              };
              xdr.onerror = function() {
                callback( 404, 'Not Found' );
              };
              xdr.onprogress = function() {};
              if ( s.xdrTimeout ) {
                xdr.ontimeout = function() {
                  callback( 0, 'timeout' );
                };
                xdr.timeout = s.xdrTimeout;
              }

              xdr.open( s.type, s.url, true );
              xdr.send( ( s.hasContent && s.data ) || null );
            },
            abort: function() {
              if ( xdr ) {
                xdr.onerror = jQuery.noop();
                xdr.abort();
              }
            }
          };
        }
      });
    }
  })( jQuery );

  window.options = {};

  //make sure Modernizr is here
  Modernizr = Modernizr || {};

  //Log the user in if access token present
  login.login();

  //only allow one popover at a time, close popovers when a user clicks off
  $('body').on('click', function(e) {
    $('[data-toggle="popover"]').siblings('.popover').each(function() {
      var $popover = $(this).siblings('[data-toggle="popover"]');
      //don't close popover if clicking on label
      if($popover.is(e.target)) { return; }

      //don't close popover if clicking on itself
      if($popover.has(e.target).length !== 0 || $('.popover').has(e.target).length !== 0) { return; }

      //don't close popover if clicking on datepicker
      if($(e.target).is('.day, .month, .year, .prev, .next, .dow, .datepicker, .datepicker-switch') || $(e.target).parents('.datepicker').length !== 0) { return; }

      $popover.popover('hide');
    });
  });

  //format for moment's calendar method
  moment.locale('en', {
    calendar : {
      lastDay : '[Yesterday]',
      sameDay : '[Today]',
      nextDay : '[Tomorrow]',
      lastWeek : 'MMM DD',
      nextWeek : 'MMM DD',
      sameElse : 'MMM DD'
    }
  });

  //add cors detection to modernizr
  Modernizr.addTest('cors', 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest());

  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({
    headerRegion: 'header.mainHeader',
    contentRegion: 'main',
    overlayRegion: '#overlay'
  });


  App.addInitializer( function () {
    //check for browser compatibility
    if(!Modernizr.svg || !Modernizr.cors || window.location.search.indexOf('unsupported') !== -1) {
      var overlayRegion = regionManager.getRegion('main_overlay');
      var o = new OverlayLayout({type: 'notSupported'});
      overlayRegion.show(o);
    }

    //check for mobile
    var md = new MobileDetect(window.navigator.userAgent);
    if(md.phone()) {
      var overlayRegion = regionManager.getRegion('main_overlay');
      var o = new OverlayLayout({type: 'notSupportedMobile'});
      overlayRegion.show(o);
    }

    //show staging banner, if on staging
    if(login.isStaging()) {
      $('#staging').show();
      if(login.isUsingStaging()) {
        $('#stagingdb').text('db: Staging').show();
      } else {
        $('#stagingdb').text('db: Production').show();
      }
    }
  });


  App.on('start', function(){
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
