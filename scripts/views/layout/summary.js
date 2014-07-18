define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/summary_tmpl',
  '../composite/filters',
  '../item/graph',
  '../item/map',
  './overlay',
  '../item/header',
  '../../controllers/login',
  './trip_list_layout'
],

function( Backbone, regionManager, SummaryTmpl, FiltersView, GraphView, MapView, OverlayView, HeaderView, login, TripListLayout ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a Summary Layout");

      $(window).on("resize", this.resize);

      //resize right away
      setTimeout(this.resize, 0);
    },


    template: SummaryTmpl,


    regions: {
      map: '#map',
      filters: '#filters',
      trips_header: '.tripsHeader',
      graph: '#graphs',
      trips: '#trips'
    },


    onRender: function () {
      var tl = new TripListLayout();
      var m = new MapView();
      var g = new GraphView();
      var f = new FiltersView();

      this.trips.show(tl);
      this.graph.show(g);
      this.map.show(m);
      this.filters.show(f);

      var headerRegion = regionManager.getRegion('main_header');
      var h = new HeaderView({attributes: {loggedIn: login.isLoggedIn}});
      headerRegion.show(h);

      var overlayRegion = regionManager.getRegion('main_overlay');
      var o = new OverlayView({type: 'loadingTrips'});
      overlayRegion.show(o);
    },


    resize: function () {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#map .map').height(height - $('#graphs').outerHeight(true) - 40);
    }
  });
});
