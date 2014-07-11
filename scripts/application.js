define([
  'backbone',
  'router',
  'regionManager',
  './views/item/user_view',
  './collections/trips',
  './controllers/util'
],

function( Backbone, router, regionManager, UserView, tripsCollection, util ) {
  'use strict';

  // get access token from cookie
  var accessToken = util.getCookie('token');

  // if playground URL, use the dummy token
  if(window.location.search.indexOf('playground') !== -1) {
    var dummyToken = 'ba56eee32df6be1437768699247b406fc7d9992f';
    accessToken = dummyToken;
  }

  //if non-matching token in sessionStorage, clear
  if(sessionStorage.getItem('accessToken') !== accessToken) {
    sessionStorage.clear();
  }

  if(accessToken) {
    //set access token in sessionStorage
    sessionStorage.setItem('accessToken', accessToken);

    $.ajaxSetup({
      headers: {'Authorization': 'token ' + accessToken},

      beforeSend: function (xhr, req) {
        try {
          // TODO: invalidate cache at 15 min.
          var obj = JSON.parse(sessionStorage.getItem(req.url) || undefined);
          this.success(obj);
          xhr.abort('cached');
        } catch (e) {
          console.warn('Request Not Cached: ' + req.url);
        }
      },

      complete: function(xhr, status) {
        try {
          if(xhr.responseText !== '[]') {
            console.log('Caching Request: ' + this.url);
            sessionStorage.setItem(this.url, xhr.responseText);
          }
        } catch (e) {
          console.warn('Could Not Cache: ' + req.url);
        }
      }
    });
  }


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
    headerRegion: "#user",
    contentRegion: "main",
    footerRegion: "footer",
    overlayRegion: "#overlay"
  });

  /* Add initializers here */
  App.addInitializer( function () {
    tripsCollection.fetchAll();

    var headerRegion = regionManager.getRegion('main_header');
    var u = new UserView({attributes: {loggedIn: (!!accessToken)}});
    headerRegion.show(u);
  });

  // contextual startup
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
