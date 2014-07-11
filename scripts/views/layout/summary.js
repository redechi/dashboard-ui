define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/summary_tmpl',
  '../composite/filters', // view
  '../item/graph', // view
  '../item/map', // view
  './overlay',
  './trip_list_layout'
],

function( Backbone, regionManager, SummaryTmpl, Filters, Graph, Map, OverlayView, TripListLayout) {
    'use strict';

  /* Return a Layout class definition */
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

    ui: {},

    events: {},

    onRender: function () {

      var tl = new TripListLayout();
      var m = new Map();
      var g = new Graph();
      var f = new Filters();

      this.trips.show(tl);
      this.graph.show(g);
      this.map.show(m);
      this.filters.show(f);

      var overlayRegion = regionManager.getRegion('main_overlay');
      var o = new OverlayView();
      overlayRegion.show(o);

    },

    resize: function () {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#map .map').height(height - $('#graphs').outerHeight(true) - 40);
    }
  });

});
