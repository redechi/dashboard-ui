define([
  'backbone',
  'hbs!tmpl/layout/summary_tmpl',
  '../composite/trips', // view
  '../composite/filters', // view
  '../item/graph', // view
  '../item/map', // view
  '../../collections/trips'
],

// this should probably be a composit view rather than a layout

function( Backbone, SummaryTmpl, Trips, Filters, Graph, Map, tripsCollection ) {
    'use strict';

  /* Return a Layout class definition */
  return Backbone.Marionette.Layout.extend({

    initialize: function() {
      console.log("initialize a Summary Layout");

      $(window).on("resize", this.resize);

      //resize right away
      setTimeout(this.resize, 0);
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
      tripsCollection.fetchAll();

      var m = new Map();
      var g = new Graph();
      var t = new Trips();
      var f = new Filters();

      this.trips.show(t);
      this.graph.show(g);
      this.map.show(m);
      this.filters.show(f);

    },

    resize: function () {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#map .map').height(height - $('#graphs').outerHeight(true) - $('.noMoveContainer').outerHeight(true) - 25);
      $('#trips ul.trips').height(height - $('#tripsHeader').outerHeight(true) - 25);
    }
  });

});
