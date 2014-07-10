define([
  'backbone',
  'hbs!tmpl/layout/summary_tmpl',
  '../composite/filters', // view
  '../item/graph', // view
  '../item/map', // view
  './trip_list_layout'
],

function( Backbone, SummaryTmpl, Filters, Graph, Map, TripListLayout) {
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
      trips: '#trips',
      user: '#user'
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

    },

    resize: function () {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#map .map').height(height - $('#graphs').outerHeight(true) - 40);
    }
  });

});
