define([
  'backbone',
  'hbs!tmpl/layout/summary_tmpl',
  '../collection/trips', // view
  '../item/graph', // view
  '../item/map', // view
  '../item/trips_header', // view
  '../item/filters' // view
],

// this should probably be a composit view rather than a layout

function( Backbone, SummaryTmpl, Trips, Graph, Map, TripsHeader, Filters) {
    'use strict';

  /* Return a Layout class definition */
  return Backbone.Marionette.Layout.extend({

    initialize: function() {
      console.log("initialize a Summary Layout");
    },

    template: SummaryTmpl,

    /* Layout sub regions */
    regions: {
      map: '#map',
      filters: '#filters',
      trips_header: '#tripsHeader',
      graph: '#graphs',
      trips: '#trips'
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function () {
      var m = new Map();
      var g = new Graph();
      var t = new Trips();
      var th = new TripsHeader();
      var f = new Filters();

      this.trips.show(t);
      this.graph.show(g);
      this.map.show(m);
      this.trips_header.show(th);
      this.filters.show(f);
    }
  });

});
