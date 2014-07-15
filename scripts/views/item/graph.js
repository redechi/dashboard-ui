define([
  'backbone',
  'communicator',
  'underscore',
  '../../collections/filters',
  'hbs!tmpl/item/graph_tmpl',
  'amlCollection',
  'moment'
],
function( Backbone, coms, _, filters, GraphTmpl, AMLCollection, moment) {
    'use strict';

  /* Return a ItemView class definition */
  var BarChart = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    model: new Backbone.Model({values:[],key:'No Data'}),
    collection: new Backbone.Collection(), // trips singleton
    template: GraphTmpl,

    collectionEvents: {
    //  'reset': 'updateGraph'
    },

    events: {
      'click .graphValue li': 'changeGraphType'
    },

    initialize: function(model) {
      console.log('initialize a Graph ItemView');
      this.collection.graphType = 'average_mpg';
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    resetCollection: function (collection) {
      this.collection.reset(collection);

      var graphType = this.collection.graphType,
      values = this.collection.getGraphSet(graphType);

      this.model.set('key', graphType);
      this.model.set('values', values);
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
      var offset = 7;

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
         .attr('stroke-opacity', 9);
     },

    /*
     *
     * updates minimum and maximum bar style
     *
     */
     updateMinMax: function () {
       var min = {y:10000},
           max = {y:0};

       d3.selectAll('rect.nv-bar').each(function (bar) {
         if (bar.y >= max.y) {
           max = bar;
         }
         if (bar.y <= max.y) {
           min = bar;
         }
       });

       d3.selectAll('rect.nv-bar').style('fill', function(bar, i){
         var color = 'url(#gradient)';
         if (bar.isMax) {
           color = 'green';
         }
         if (bar.isMin) {
           color = 'red';
         }
         return color;
       });

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

      chart.margin({top: 0, right: 0, bottom: 20, left: 0});
      chart.showYAxis(false);
      chart.reduceXTicks(false);
      chart.xAxis.tickFormat(d3.format(',f'));
      chart.xAxis.tickFormat(function(d) {
        return d3.time.format('%e')(new Date(d));
      });

      chart.height = 160;

      nv.utils.windowResize(chart.update);
      chart.tooltipContent(function(key, y, e, graph) {
        return '<p>' + key + ': ' + e + '</p>';
      });

      var svg = d3.select(this.$el.find('svg').get(0))
         .attr("height", chart.height);

      var defs = svg.append("svg:defs");

      this.updateGraph();
      this.appendSVGGradient(defs);
      this.appendSVGBarMask(defs);

      return chart;
    },


    changeGraphType: function (e) {
      var graphType = $(e.currentTarget).data('value');
      this.collection.graphType = graphType;
      var values = this.getGraphData(graphType);
      this.model.set('values', values);
      this.updateGraph();
    },


    updateGraph: function () {
      var datum = this.model.toJSON();

      // group by day.
      var byDay = {};
      _.each(datum.values, function (obj) {
        var day = new Date(obj.x).getUTCDate();
        byDay[day] =  byDay[day] || {x:0,y:0};
        byDay[day].y += obj.y;
        byDay[day].x  = obj.x;
      });

      // convert to array
      var valuesOut = [];
      for (var i in byDay) {
        valuesOut.push(byDay[i]);
      }

      // sort by date
      datum.values = valuesOut.sort(function (a,b) {
        return new Date(b.x) < new Date(a.x);
      });

      // determine max / min
      var min = _.min(datum.values, function (val) { return val.y; });
      var max = _.max(datum.values, function (val) { return val.y; });
      min.isMin = true;
      max.isMax = true;

      this.chart.max = max.y;

      d3.select(this.$el.find('svg').get(0))
        .datum([datum])
        .call(this.chart);

      this.updateBarStyle();
      this.updateMinMax();

    },


    onRender: function() {
      nv.addGraph(_.bind(this.addGraph, this));

      //show/hide nextDates button
      var dateFilter = filters.findWhere({name: 'date'});
      if(dateFilter) {
        var dateRange = dateFilter.get('value');
        this.$el.find('.nextDates').toggle(dateRange[1] < Date.now());
      }

      setTimeout(function() {
        $('.graphType').popover('destroy');
        var graphPopoverTemplate = $('.graphMenu .popoverTemplate');
        $('.graphType').popover({
          html: true,
          content: function() { return graphPopoverTemplate.html(); },
          title: function() { return graphPopoverTemplate.attr('title'); },
          placement: 'bottom'
        });
      }, 0);
    }
  });

  return BarChart;
});
