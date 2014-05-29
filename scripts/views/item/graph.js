define([
  'backbone',
  'd3',
  'underscore',
  '../../collections/trips',
  'hbs!tmpl/item/graph_tmpl'
],
function( Backbone, d3, _, trips, GraphTmpl) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    defaults: {
      ymax: 100,
      values: {
        duration: 100
      }
    },

    initialize: function() {
      console.log("initialize a Graph ItemView");
      this.$el.addClass('graph');
      this.listenTo(this.collection, "sync", this.syncModel, this);
    },

    syncModel: function () {
      var collection = this.collection;
      this.model.set('data', this.collection.getGraphSet('distance_m'));

      var changed = {
        distance: parseInt(100 * collection.setAgg('distance').aggregate()) / 100,
        someOtherAgg: 0
      };

      this.model.set(changed);
      this.drawGraph(this.model.get('data'));
    },

    model: new Backbone.Model({}),

    collection: trips, // trips singleton

    template: GraphTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {},

    unitFomatter: function () {},

    yAxisLabel: function () {}, // overwrite me

    setYAxisLabel: function () {
      // TODO: replace with one from controllers file
    },

    drawGraph: function (graphData) {
      graphData = graphData || [];

      var binSize = 1,
          xAxisTicks,
          xAxisTickFormat,
          popupTimeFormat,
          graphWidth = this.$el.width(),
          graphHeight = this.$el.height();

      this.$el.empty();

      var margin = {top: 20, right: 40, bottom: 30, left: 50},
          width = graphWidth,
          height = graphHeight - 50,
          bisectDate = d3.bisector(function(d) { return d.key; }).left;

      var parseDate = d3.time.format("%Y-%m").parse;
      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      // x.domain([dateRange[0], dateRange[1]]);
      // y.domain([0, graphData.yMax || d3.max(_.pluck(graphData.data, 'value'))]);

      var barCount = moment(x.domain()[1]).diff(moment(x.domain()[0]), binSize + 's');
      var barWidth = (barCount > 20) ? (width/barCount - 2) : (width/barCount - 4);
      if(binSize == 'day' && barCount >= 60) {
        xAxisTicks = d3.time.month;
        xAxisTickFormat = d3.time.format("%b %Y");
        popupTimeFormat = 'MMM D, YYYY';
      } else if(binSize == 'day' && barCount < 60) {
        xAxisTicks = d3.time.week;
        xAxisTickFormat = d3.time.format("%b %e, %Y");
        popupTimeFormat = 'MMM D, YYYY';
      } else  {
        xAxisTicks = 12 ;
        xAxisTickFormat = d3.time.format("%-I %p");
        popupTimeFormat = 'h:mm A MMM D, YYYY';
      }

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(xAxisTicks)
          .tickFormat(xAxisTickFormat);

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(8);

      var svg = d3.select(this.el).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text");
 
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-3.2em")
        .style("text-anchor", "end")
        .text(this.yAxisLabel);

      svg.selectAll("bar")
        .data(this.model.get('data'))
        .enter().append("rect")
        .attr("x", function(d) { return x(d.key); })
        .attr("width", '200px')
        .attr("fill-opacity", 0.6)
        // .attr("data-start", function(d) { return getStartTs(d.key, binSize); })
        // .attr("data-end", function(d) { return getEndTs(d.key, binSize); })
        .attr("data-bin-size", binSize)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })

        .on("mouseover", function(d){
          d3.select(this).attr('class', 'highlighted');
          tooltip.style("visibility", "visible").html(graphData.unitFomatter(d) + '<br>' + moment(d.key).format(popupTimeFormat));
          highlightTrips(filterTripsByDateRange(filterTrips(), [getStartTs(d.key, binSize), getEndTs(d.key, binSize)]));
        })

        .on("mousemove", function(){
          tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })

        .on("mouseout", function(){
          tooltip.style("visibility", "hidden");
          d3.select(this).attr('class', '');
          clearHighlightedTrips();
        });
    }
  });

});
