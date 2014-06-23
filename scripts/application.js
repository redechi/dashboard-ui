define([
  'backbone',
  'communicator',
  'router',
  'regionManager',
  './views/item/user_view',
  './collections/trips'
],

function( Backbone, Communicator, router, regionManager, UserView, tripsCollection ) {
  'use strict';

  function getCookie(key) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  }

  // get access token from cookie
  var accessToken = getCookie('token') || 'ba56eee32df6be1437768699247b406fc7d9992f';

  $.ajaxSetup({
    headers: {'Authorization': 'token ' + accessToken},

    beforeSend: function (xhr, req) {
      try {
        // TODO: invalidate cache at 15 min.
        var obj = JSON.parse(sessionStorage.getItem(req.url) || undefined);
        this.success(obj);
        xhr.abort(obj);
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
    headerRegion: "#user",
    contentRegion: "main",
    footerRegion: "footer",
    overlayRegion: "#popover"
  });

  /* Add initializers here */
  App.addInitializer( function () {
    tripsCollection.fetchAll();

    var headerRegion = regionManager.getRegion('main_header');
    var u = new UserView();
    headerRegion.show(u);
  });

  // contextual startup
  App.on("initialize:after", function(){
    console.log('Start History');
    Backbone.history.start();
  });

  // save regions
  regionManager.addRegion('main_content', App.contentRegion);
  regionManager.addRegion('main_header', App.headerRegion);
  regionManager.addRegion('main_footer', App.footerRegion);
  regionManager.addRegion('main_overlay', App.overlayRegion);

  return App;
});
