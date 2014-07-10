define([
  'backbone',
  'communicator',
  'router',
  'regionManager',
  './views/item/user_view',
  './collections/trips',
  './controllers/util'
],

function( Backbone, Communicator, router, regionManager, UserView, tripsCollection, util ) {
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

  //extend popover to allow callback
  var tmp = $.fn.popover.Constructor.prototype.show;
  $.fn.popover.Constructor.prototype.show = function () {
    tmp.call(this);
    if (this.options.callback) {
      this.options.callback();
    }
  };


  var App = new Backbone.Marionette.Application();

  /* Add application regions here */
  App.addRegions({
    headerRegion: "#user",
    contentRegion: "main",
    footerRegion: "footer"
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

  return App;
});
