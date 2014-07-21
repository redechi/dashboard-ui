define([
  'backbone',
  'communicator',
  '../../collections/filters',
  'hbs!tmpl/item/graph_tmpl',
  'controllers/stats',
  'controllers/unit_formatters'
],
function( Backbone, coms, filters, GraphTmpl, stats, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    tagName: 'div',

    model: new Backbone.Model({
      values: [],
      graphType: 'average_mpg',
      graphTypeName: 'MPG',
      graphTypeUnit: 'MPG'
    }),

    collection: new Backbone.Collection(),

    template: GraphTmpl,

    events: {
      'click .graphValue li': 'changeGraphType'
    },

    initialize: function(model) {
      console.log('initialize a Graph ItemView');
      coms.on('filter', _.bind(this.resetCollection, this));
    },


    resetCollection: function (collection) {
      this.collection.reset(collection);

      this.getGraphData();
      this.makeGraph();
      this.setDateRange();
    },


    averageTripsForGraph: function() {
      var graphType = this.model.get('graphType'),
          values = this.model.get('values'),
          trips = this.collection;

      //Calculate average depending on graphType
      if(graphType == 'average_mpg') {
        return stats.getAverageMPG(trips);
      } else if(graphType == 'score') {
        return stats.getAverageScore(trips);
      } else {
        var total = values.reduce(function(memo, value) {
          return memo + value.values;
        }, 0);
        return total / values.length || 0;
      }
    },


    getGraphData: function () {
      var graphType = this.model.get('graphType'),
          dateRange = filters.findWhere({name: 'date'}).get('value'),
          date = dateRange[0],
          bins = {};


      //Build empty bins
      while(date < dateRange[1]) {
        bins[moment(date).startOf('day').valueOf()] = [];
        date = moment(date).add('days', 1).valueOf();
      }


      //group trips into bins
      this.collection.each(function(trip) {
        var bin = moment(trip.get('start_time')).startOf('day').valueOf();
        bins[bin].push(trip);
      });


      //Combine trips into one number
      var values = _.map(bins, function(trips, key) {
        return {key: key, values: stats.sumTrips(trips, graphType)};
      });

      this.model.set('values', values);


      //Calculate Min and Max and Empty bins
      var summary = _.reduce(values, function(memo, bar) {
        if ((!memo.max || bar.values >= memo.max.values) && bar.values > 0) {
          memo.max = bar;
        }
        if ((!memo.min || bar.values <= memo.min.values) && bar.values > 0) {
          memo.min = bar;
        }
        if(bar.values === 0) {
          memo.empty.push(bar.key);
        }
        return memo;
      }, {empty: []});

      //Calculate overall average for time range
      summary.average = this.averageTripsForGraph();

      this.model.set('summary', summary);
    },


    updateAverages: function() {
      var graphType = this.model.get('graphType'),
          graphTypeName = this.model.get('graphTypeName'),
          graphTypeUnit = this.model.get('graphTypeUnit'),
          summary = this.model.get('summary');

      $('.graphAveragesBackground').text(graphTypeUnit);
      $('.graphAveragesValue').text(formatters.formatForGraphLabel(graphType, summary.average));
    },


    appendSVGGradient: function (defs) {
      var gradient = defs.append('svg:linearGradient')
        .attr('id', 'graphGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad');

      gradient.append('svg:stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f1efeb')
        .attr('stop-opacity', 0);

      gradient.append('svg:stop')
        .attr('offset', '86%')
        .attr('stop-color', '#F4F2EF')
        .attr('stop-opacity', 1);

      return defs;
    },


    makeGraph: function() {
      var data = this.model.get('values'),
          summary = this.model.get('summary'),
          dateRange = filters.findWhere({name: 'date'}).get('value'),
          graphType = this.model.get('graphType'),
          margin = {top: 30, right: 0, bottom: 60, left: 0},
          width = 880 - margin.left - margin.right,
          height = 225 - margin.top - margin.bottom,
          tooltip = d3.select('#graphs .graphContainer .graphTooltip');


      //remove any existing graph
      d3.select('#graphs .graphContainer svg').remove();


      //update averages
      this.updateAverages();


      //Initialize SVG
      var svg = d3.select('#graphs .graphContainer').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //SVG defs for gradient
      var defs = svg.append("svg:defs");

      this.appendSVGGradient(defs);

      svg.append('rect')
        .attr('class', 'graphGradient')
        .attr('width', '100%')
        .attr('height', height);


      //scales
      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], 0.1)
          .domain(data.map(function(d) { return d.key; }));

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, d3.max(data, function(d) { return d.values; })]);


      //axes
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .tickFormat(function(d) {return moment(parseInt(d, 10)).format('D'); });

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(5)
          .tickSize(-width, 0, 0)
          .tickFormat('');

      svg.selectAll('.x.axis').append('line')
        .attr('class', 'bottom')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0);

      svg.append('g')
        .attr('class', 'grid')
        .call(yAxis);


      //Draw bars
      var barWidth = Math.min(x.rangeBand(), 8);
      var barRadius = Math.min(barWidth/2, 4);

      var bars = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
          .attr('class', 'bar')
          .attr('y', function(d) { return y(d.values); })
          .attr('x', function(d) { return x(d.key); })
          .attr('date', function(d) { return d.key; });

      function barMouseover(d) {
        tooltip
          .style('top', (y(d.values) - 4) + 'px')
          .style('left', (x(d.key) - 28) + 'px')
          .style('visibility', 'visible')
          .html('<div class="arrow"></div><div class="date">' + moment(parseInt(d.key, 10)).format('MMM D') + '</div><div class="value">' + d.values.toFixed(1) + '</div>');
      }

      function barMouseout(d) {
        tooltip.style('visibility', 'hidden');
      }

      function topRoundedRect(x, y, width, height, radius) {
        return 'M' + (x + radius) + ',' + y
             + 'h' + (width - (2 * radius))
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius
             + 'v' + (height - radius)
             + 'h' + (-width)
             + 'v' + (radius - height)
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + (-radius)
             + 'z';
      }

      bars.append('path')
        .on('mouseover', barMouseover)
        .on('mouseout', barMouseout)
        .attr('d', function(d) {
          if(d.values > 0) {
            return topRoundedRect(x(d.key), y(d.values), barWidth, height - y(d.values), barRadius);
          }
        });


      //styles for max
      if(summary.max) {
        var maxBar = bars
          .filter(function(d) { return d.key === summary.max.key})
          .classed('max', true);

        maxBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dx', barWidth/2)
            .attr('dy', '-1.75em')
            .text('MAX')
            .attr('text-anchor', 'middle')
            .attr('class', 'barLabel');

        maxBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dx', barWidth/2)
            .attr('dy', '-0.55em')
            .text(function(d) { return formatters.formatForGraphLabel(graphType, d.values); })
            .attr('text-anchor', 'middle');
      }


      //styles for min
      if(summary.min) {
        var minBar = bars
          .filter(function(d) { return d.key === summary.min.key})
          .classed('min', true);

        minBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dx', barWidth/2)
            .attr('dy', '-1.75em')
            .text('MIN')
            .attr('text-anchor', 'middle')
            .attr('class', 'barLabel');

        minBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dx', barWidth/2)
            .attr('dy', '-0.55em')
            .text(function(d) { return formatters.formatForGraphLabel(graphType, d.values); })
            .attr('text-anchor', 'middle');
      }


      //X Axis labels
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'middle')
          .attr('dx', '-.5em')
          .attr('class', function(d) {return (summary.empty.indexOf(d) !== -1) ? 'empty' : ''; });
    },


    changeGraphType: function (e) {
      var graphType = $(e.currentTarget).data('value'),
          graphTypeName = $(e.currentTarget).text(),
          graphTypeUnit = $(e.currentTarget).data('unit');

      this.model.set({
        'graphType': graphType,
        'graphTypeName': graphTypeName,
        'graphTypeUnit': graphTypeUnit
      });

      $('.graphValue li').removeClass();
      $('.graphValue li[data-value="' + graphType + '"]').addClass('selected');

      $('.graphType')
        .text(graphTypeName)
        .popover('hide');

      this.getGraphData();
      this.makeGraph();
    },


    setDateRange: function() {
      var dateRange = filters.findWhere({name: 'date'}).get('value');
      $('#graphs .dateRange').text(formatters.dateRange(dateRange));
    },


    onShow: function() {
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
});
