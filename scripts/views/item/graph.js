define([
  'backbone',
  'communicator',
  '../../base/charts/bar',
  '../../collections/trips',
  'hbs!tmpl/item/graph_tmpl'
],
function( Backbone, coms, BarChartBase, trips, GraphTmpl) {
  'use strict';
  console.log(arguments)

  /* Return a ItemView class definition */
  var BarChart = Backbone.Marionette.ItemView.extend({

    tagName: "div",

    initialize: function(model) {
      console.log("initialize a Graph ItemView");
    },

    collectioin: trips,

    collection: trips, // trips singleton

    template: GraphTmpl,

    /* ui selector cache */
    ui: {},

    collectionEvents: {
      'reset': 'render'
    },

    /* Ui events hash */
    events: {},

    addGraph: function() {
      var chart = nv.models.multiBarChart()
        .transitionDuration(350)
        .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
        .rotateLabels(0)      //Angle to rotate x-axis labels.
        .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
        .groupSpacing(0.1);   //Distance between each group of bars.

      var values = this.collection.getGraphSet('distance_m');
      var datum = {
        key: 'trips',
        values: values
      }

      chart.xAxis.tickFormat(d3.format(',f'));
      chart.xAxis.tickFormat(function(d) {
        // Will Return the date, as "%m/%d/%Y"(08/06/13)
        return d3.time.format('%x')(new Date(d))
      });

      nv.utils.windowResize(chart.update);

      d3.select(this.$el.find('svg')[0])
        .datum([datum])
        .call(chart);

      return chart;
    },

    /* on render callback */
    onRender: function() {
      nv.addGraph(_.bind(this.addGraph, this));
    }

  });

  return BarChart;
});
