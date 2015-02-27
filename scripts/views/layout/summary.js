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

    template: SummaryTmpl,
    selectors: {},


    initialize: function() {
      coms.off('resize');
      coms.off('error:403');
      coms.off('error:500');
      coms.off('error:noTrips');
      coms.off('trips:showSingleTripOverlay');
      coms.off('trips:showDownloadExportOverlay');

      coms.on('resize', this.resize, this);
      coms.on('error:403', this.error403, this);
      coms.on('error:500', this.error500, this);
      coms.on('error:noTrips', this.noTrips, this);

      coms.on('trips:showSingleTripOverlay', this.showSingleTripOverlay, this);
      coms.on('trips:showDownloadExportOverlay', this.showDownloadExportOverlay, this);
    },


    regions: {
      map: '#map',
      filters: '#filters',
      graph: '#graphs',
      trips: '#trips',
      singleTrip: '#singleTrip'
    },


    onRender: function () {
      new OverlayLayout({type: 'loadingTrips'});

      var tl = new TripListLayout();
      var m = new MapView();
      var g = new GraphView();
      var f = new FiltersView();
      var h = new HeaderView({attributes: {
        loggedIn: login.isLoggedIn,
        licenseplusMenu: 'dashboard'
      }});

      this.trips.show(tl);
      this.graph.show(g);
      this.map.show(m);
      this.filters.show(f);
      regionManager.getRegion('main_header').show(h);
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
      if(this.selectors) {
        var height = this.selectors.window.height() - this.selectors.tabletWarning.outerHeight(true) - this.selectors.header.outerHeight(true) - this.selectors.filters.outerHeight(true);
        this.selectors.map.height(height - this.selectors.graphs.outerHeight(true) - this.selectors.mapMenu.outerHeight(true) - 31);
      }
    },


    error403: function () {
      new OverlayLayout({type: 'error403'});
    },


    error500: function () {
      new OverlayLayout({type: 'error500'});
    },


    noTrips: function () {
      new OverlayLayout({type: 'noTrips'});
    },


    showSingleTripOverlay: function (trip, collection) {
      new OverlayLayout({
        activeMask: true,
        contentView: new SingleTripLayout({
          model: trip,
          collection: collection
        }),
        type: 'singleTrip'
      });
    },


    showDownloadExportOverlay: function (blobUrl) {
      new OverlayLayout({
        type: 'downloadExport',
        blobUrl: blobUrl
      });
    }
  });
});
