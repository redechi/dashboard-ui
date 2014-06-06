define([
  'backbone',
  'communicator',
  'underscore',
  '../../collections/trips',
  'hbs!tmpl/item/graph_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, comms, _, trips, GraphTmpl, formatters) {
    'use strict';

  /* Return a ItemView class definition */
  var BarChart = Backbone.Marionette.ItemView.extend({

    tagName: "div",

    initialize: function(model) {
      console.log("initialize a Graph ItemView");
      this.collection.graphType = 'average_mpg';
    },

    collection: trips, // trips singleton

    collectionEvents: {
      'reset': 'render',
      'sync': 'render'
    },

    template: GraphTmpl,

    templateHelpers: function() {
      var helpers =  {
        distance: formatters.distance(this.collection.reduce(function(memo, trip) { return memo + trip.get('distance_miles'); }, 0)),
        duration: formatters.duration(this.collection.reduce(function(memo, trip) { return memo + trip.get('duration'); }, 0)),
        score: formatters.score(this.collection.getAverageScore()),
        cost: formatters.cost(this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_cost_usd'); }, 0))
      };

      helpers.mpg = formatters.averageMPG(helpers.distance / this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_volume_gal'); }, 0))

      return helpers;
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
      'click .stat': 'changeGraph'
    },

    addGraph: function() {
      var graphType = this.collection.graphType;
      var chart = this.chart = nv.models.multiBarChart()
        .transitionDuration(150)
        .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
        .rotateLabels(0)      //Angle to rotate x-axis labels.
        .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
        .groupSpacing(0.1);   //Distance between each group of bars.

      var values = this.collection.getGraphSet(graphType);
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

      d3.select(this.$el.find('svg').get(0))
        .datum([datum])
        .call(chart);

      return chart;
    },


    changeGraph: function (e) {
      this.collection.graphType = $(e.currentTarget).data('graph-type');

      $(e.currentTarget)
        .addClass('active')
        .siblings()
          .removeClass('active');

      this.updateGraph();
    },


    updateGraph: function () {
      var graphType = this.collection.graphType,
          chart = this.chart;

      var values = this.collection.getGraphSet(graphType);
      var datum = {
        key: 'trips',
        values: values
      }

      d3.select(this.$el.find('svg').get(0))
        .datum([datum])
        .call(chart);
    },

    onRender: function() {
      nv.addGraph(_.bind(this.addGraph, this));
    }
  });

  return BarChart;
});
