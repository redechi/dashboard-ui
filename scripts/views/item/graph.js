define([
  'backbone',
  'communicator',
  'underscore',
  '../../collections/filters',
  'hbs!tmpl/item/graph_tmpl',
  'amlCollection'
],
function( Backbone, coms, _, filters, GraphTmpl, AMLCollection) {
    'use strict';

  /* Return a ItemView class definition */
  var BarChart = Backbone.Marionette.ItemView.extend({

    tagName: "div",
    model: new Backbone.Model({}),
    collection: new AMLCollection([]), // trips singleton
    template: GraphTmpl,

    collectionEvents: {
      'reset': 'updateGraph'
    },

    events: {
      'click .prevDates': 'prevDateRange',
      'click .nextDates': 'nextDateRange',
      'change .graphType': 'selectGraph'
    },

    initialize: function(model) {
      console.log("initialize a Graph ItemView");
      this.collection.graphType = 'average_mpg';
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    resetCollection: function (collection) {
      this.collection.reset(collection.toArray());

      var graphType = this.collection.graphType,
      values = this.collection.getGraphSet(graphType);

      this.model.set('key', graphType);
      this.model.set('values', values)
    },


    /*
     *
     * creates an svg gradient variable
     *
     */
    appendSVGGradient: function (defs) {
      var gradient = defs.append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

      gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fff")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", "#fefefe")
        .attr("stop-opacity", 1);

      return defs;
    },


    /*
     *
     * Crops the bottom of of each bar.
     *
     */
    appendSVGBarMask: function (defs) {
      var offset = 7

      d3.selectAll('.nv-group[class*="nv-series"]')
        .attr("transform", "translate(0,"+offset+")");

      defs.append("clipPath")
        .attr("id","clipper")
        .append('rect')
        .attr('y', -offset-2)
        .attr('width','346')
        .attr('height','118');

      return defs;
    },

    /*
     *
     * updates bar style
     *
     */
     updateBarStyle: function () {
       d3.selectAll("rect.nv-bar")
         .attr("rx", '9')
         .attr('ry', '9')
         .attr('clip-path',"url(#clipper)")
         .attr('stroke', '#d9d8d4')
         .attr('stroke-opacity', 9)
         .style('fill', 'url(#gradient)');
     },

    /*
     *
     * initializes graph.
     *
     */
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

      nv.utils.windowResize(chart.update);

      chart.margin({top: 0, right: 0, bottom: 20, left: 0})
      chart.showYAxis(false);
      chart.reduceXTicks(false);
      chart.xAxis.tickFormat(d3.format(',f'));
      chart.xAxis.tickFormat(function(d) {
        return d3.time.format('%e')(new Date(d))
      });


      var svg = d3.select(this.$el.find('svg').get(0))
         .attr("height", "150")
         .datum([this.model.toJSON()])
         .call(chart);

      var defs = svg.append("svg:defs");

      this.appendSVGGradient(defs);
      this.appendSVGBarMask(defs);
      this.updateBarStyle();

      return chart;
    },

    /*
     *
     * changes graph from select element.
     *
     */
    selectGraph: function (e) {
      var select = e.currentTarget;
      var value  = $(select).find(":selected").val();
      this.collection.graphType = value;
      var values = this.collection.getGraphSet(value);
      this.model.set('values', values)
      this.updateGraph();
    },

    /*
     *
     * updates graph values.
     *
     */
    updateGraph: function () {
      d3.select(this.$el.find('svg').get(0))
        .datum([this.model.toJSON()])
        .call(this.chart);

      this.updateBarStyle();
    },


    prevDateRange: function () {
      var dateFilter = filters.findWhere({name: 'date'});
      _.bind(dateFilter.get('setPrevRange'), dateFilter)();
      coms.trigger('filters:updateDateFilterLabel');
    },

    nextDateRange: function () {
      var dateFilter = filters.findWhere({name: 'date'});
      _.bind(dateFilter.get('setNextRange'), dateFilter)();
      coms.trigger('filters:updateDateFilterLabel');
    },

    onRender: function() {
      nv.addGraph(_.bind(this.addGraph, this));
    }
  });

  return BarChart;
});
