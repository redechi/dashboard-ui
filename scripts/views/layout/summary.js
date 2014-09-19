define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/summary_tmpl',
  '../composite/filters',
  '../item/graph',
  '../item/map',
  './single_trip',
  './overlay',
  '../item/header',
  '../../controllers/login',
  './trip_list_layout'
],

function( Backbone, coms, regionManager, SummaryTmpl, FiltersView, GraphView, MapView, SingleTripLayout, OverlayLayout, HeaderView, login, TripListLayout ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      coms.on('resize', _.bind(this.resize, this));

      coms.on('error:403', _.bind(this.error403, this));
      coms.on('error:500', _.bind(this.error500, this));
      coms.on('error:noTrips', _.bind(this.noTrips, this));

      coms.on('trips:showSingleTripOverlay', _.bind(this.showSingleTripOverlay, this));
      coms.on('trips:closeSingleTripOverlay', _.bind(this.hideSingleTrip, this));

      this.selectors = {};
    },


    template: SummaryTmpl,


    regions: {
      map: '#map',
      filters: '#filters',
      graph: '#graphs',
      trips: '#trips',
      singleTrip: '#singleTrip'
    },


    onRender: function () {
      regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'loadingTrips'}));

      var tl = new TripListLayout();
      var m = new MapView();
      var g = new GraphView();
      var f = new FiltersView();

      this.trips.show(tl);
      this.graph.show(g);
      this.map.show(m);
      this.filters.show(f);

      regionManager.getRegion('main_header').show(new HeaderView({attributes: {loggedIn: login.isLoggedIn}}));
    },


    onShow: function () {
      _.defer(_.bind(function() {
        this.selectors = {
          window: $(window),
          tabletWarning: $('.tabletWarning:visible'),
          header: $('header'),
          filters: $('#filters'),
          graphs: $('#graphs', this.$el),
          mapMenu: $('.mapMenu', this.$el),
          map: $('#leftColumn #map .map', this.$el)
        };

        this.resize();
      }, this));
    },


    resize: function () {
      var height = this.selectors.window.height() - this.selectors.tabletWarning.outerHeight(true) - this.selectors.header.outerHeight(true) - this.selectors.filters.outerHeight(true);
      this.selectors.map.height(height - this.selectors.graphs.outerHeight(true) - this.selectors.mapMenu.outerHeight(true) - 31);
    },


    error403: function () {
      regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'error403'}));
    },


    error500: function () {
      regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'error500'}));
    },


    noTrips: function () {
      regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'noTrips'}));
    },


    showSingleTripOverlay: function (trip, collection) {
      regionManager.getRegion('main_overlay').show(new OverlayLayout());
      this.singleTrip.show(new SingleTripLayout({model: trip, collection: collection}));
    },


    hideSingleTrip: function () {
      regionManager.getRegion('main_overlay').reset();
      this.singleTrip.reset();
    }
  });
});
