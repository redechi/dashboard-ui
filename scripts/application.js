define([
  'domReady!',
  'backbone',
  'communicator',
  'router',
  'regionManager',
  'moment',
  './controllers/login',
  './collections/trips',
  './views/layout/overlay',
  'fastclick',
  'mobile-detect',
  'bootstrapSlider',
  'bootstrapDatetimepicker',
  'bootstrap/popover'
],

function( doc, Backbone, coms, router, regionManager, moment, login, tripsCollection, OverlayLayout, FastClick, MobileDetect ) {
  'use strict';

  //make sure Modernizr is here
  Modernizr = Modernizr || {};

  //add fastclick to make mobile touch events fast
  $(function() {
    FastClick.attach(document.body);
  });

  //Log the user in if access token present
  login.setAccessToken();

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
    },
    week : {
      dow : 1
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
    var overlayRegion = regionManager.getRegion('main_overlay'),
        overlayLayout,
        md = new MobileDetect(window.navigator.userAgent);

    //check for browser compatibility
    if(!Modernizr.svg || !Modernizr.cors || window.location.search.indexOf('unsupported') !== -1) {
      overlayLayout = new OverlayLayout({type: 'notSupported'});
      overlayRegion.show(overlayLayout);
    }

    //check for mobile
    if(md.is('iPhone')) {
      $('body').addClass('isiPhone');
    } else if(md.is('android')) {
      $('body').addClass('isAndroid');
    }

    //if tablet and user hasn't already closed the warning, show it
    if(sessionStorage.getItem('warningClosed') !== 'true' && md.tablet() !== null) {
      $('.tabletWarning').slideDown('slow', function() {
        coms.trigger('resize');
      });
    }

    //tablet warning click function
    $('.closeWarning').click(function() {
      $('.tabletWarning').slideUp('fast', function() {
        coms.trigger('resize');
      });
      sessionStorage.setItem('warningClosed', 'true');
    });

    //show staging banner, if on staging
    if(login.isStaging()) {
      $('#staging').show();
      if(login.isUsingStaging()) {
        $('#stagingdb').text('db: Staging').show();
      } else {
        $('#stagingdb').text('db: Production').show();
      }
    }

    //listen for resize
    $(window).on('resize', _.debounce(function() {
      coms.trigger('resize');
    }, 100));
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
