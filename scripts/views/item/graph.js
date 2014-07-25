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

      $(window).on("resize", _.bind(this.makeGraph, this));
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
          binSize,
          bins = {};

      //Calculate bin size
      var days = moment.duration(dateRange[1] - dateRange[0]).asDays();

      if(days <= 120) {
        //use days as bin
        binSize = 'day';
      } else {
        //use months as bin
        binSize = 'month';
      }

      this.model.set('binSize', binSize);

      while(date < dateRange[1]) {
        bins[moment(date).startOf(binSize).valueOf()] = [];
        date = moment(date).add(binSize + 's', 1).valueOf();
      }


      //group trips into bins
      this.collection.each(function(trip) {
        var bin = moment(trip.get('start_time')).startOf(binSize).valueOf();
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
        return memo;
      }, {});

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


    getBarWidth: function (data, width) {
      return Math.max((width / data.length - 15), 8);
    },


    getTickLabel: function(d) {
      var binSize = this.model.get('binSize'),
          data = this.model.get('values');

      if(binSize === 'month') {
        return moment(parseInt(d.key, 10)).format('MMM');
      } else if(binSize === 'day') {
        if(data.length <= 60) {
          return moment(parseInt(d.key, 10)).format('D');
        } else if(data.length <= 120) {
          //Only return odd days
          var day = moment(parseInt(d.key, 10)).format('D');
          return (day % 2 === 1) ? day : '';
        }
      }
    },


    getMonthLabel: function(d) {
      var data = this.model.get('values'),
          date = moment(parseInt(d.key, 10));

      if(date.date() === 1 || (d.key === data[0].key && date.date() < 29)) {
        //only show month label at start of months and first position
        return date.format('MMMM YYYY');
      }
    },


    getYearLabel: function(d) {
      var data = this.model.get('values'),
          date = moment(parseInt(d.key, 10));
      if(date.month() === 0 || (d.key === data[0].key && date.date() < 29)) {
        //only show year label at start of years and first position
        return date.format('YYYY');
      }
    },


    makeGraph: function() {
      var self = this,
          data = this.model.get('values'),
          summary = this.model.get('summary'),
          dateRange = filters.findWhere({name: 'date'}).get('value'),
          graphType = this.model.get('graphType'),
          binSize = this.model.get('binSize'),
          margin = {top: 30, right: 0, bottom: 60, left: 0},
          outerWidth = $('#graphs').width(),
          width = outerWidth - margin.left - margin.right,
          height = 225 - margin.top - margin.bottom,
          tooltip = $('#graphs .graphContainer .graphTooltipContainer'),
          binWidth = width / data.length,
          barWidth = this.getBarWidth(data, width),
          barRadius = Math.min(barWidth/2, 8);


      //remove any existing graph
      d3.select('#graphs .graphContainer svg').remove();


      //If no data, no graph
      if(!data || !data.length) {
        return;
      }

      //update averages
      this.updateAverages();


      //Initialize SVG
      var svg = d3.select('#graphs .graphContainer').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


      //SVG defs for gradient
      this.appendSVGGradient(svg.append("svg:defs"));
      svg.append('rect')
        .attr('class', 'graphGradient')
        .attr('width', '100%')
        .attr('height', height);


      //scales
      var x = d3.scale.linear()
          .range([0, width - (binWidth / 2)])
          .domain([
            parseInt(d3.min(data, function(d) { return d.key; }), 10) - moment.duration(0.5, binSize + 's').valueOf(),
            parseInt(d3.max(data, function(d) { return d.key; }), 10)
          ]);

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, d3.max(data, function(d) { return d.values; })]);


      //axes
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
      var bars = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
          .attr('class', 'bar')
          .attr('y', function(d) { return y(d.values); })
          .attr('x', function(d) { return x(d.key); })
          .attr('date', function(d) { return d.key; });

      function barMouseover(d) {
        var tooltipContent = '<div class="arrow"></div><div class="date">' + moment(parseInt(d.key, 10)).format('MMM D') + '</div><div class="value">' + formatters.formatForGraphLabel(graphType, d.values) + '</div>';
        tooltip
          .css({
            top: (y(d.values) - 32) + 'px',
            left: x(d.key) + 'px',
            visibility: 'visible'
          })
          .find('.graphTooltip')
            .html(tooltipContent);
      }

      function barMouseout(d) {
        tooltip.css('visibility', 'hidden');
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
            return topRoundedRect(x(d.key) - (barWidth/2), y(d.values), barWidth, height - y(d.values), barRadius);
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
            .attr('dy', '-1.75em')
            .text('MAX')
            .attr('text-anchor', 'middle')
            .attr('class', 'barLabel');

        maxBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dy', '-0.55em')
            .text(function(d) { return formatters.formatForGraphLabel(graphType, d.values); })
            .attr('text-anchor', 'middle');
      }


      //styles for min
      if(summary.min && (summary.min !== summary.max)) {
        var minBar = bars
          .filter(function(d) { return d.key === summary.min.key})
          .classed('min', true);

        minBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dy', '-1.75em')
            .text('MIN')
            .attr('text-anchor', 'middle')
            .attr('class', 'barLabel');

        minBar.append('text')
            .attr('x', function(d) { return x(d.key); })
            .attr('y', function(d) { return y(d.values); })
            .attr('dy', '-0.55em')
            .text(function(d) { return formatters.formatForGraphLabel(graphType, d.values); })
            .attr('text-anchor', 'middle');
      }


      //X Axis labels
      bars.append('text')
        .attr('transform', 'translate(0,' + (height + 20) + ')')
        .attr('x', function(d) { return x(d.key); })
        .style('text-anchor', 'middle')
        .attr('class', function(d) {return (d.values === 0) ? 'empty' : ''; })
        .classed('tickLabel', true)
        .text(_.bind(self.getTickLabel, this));

      //Month and Year Labels
      if(binSize === 'day') {
        bars.append('text')
          .attr('transform', 'translate(0,' + (height + 45) + ')')
          .attr('x', function(d) { return x(d.key); })
          .attr('dx', -barWidth/2)
          .style('text-anchor', 'right')
          .classed('axisLabel', true)
          .text(_.bind(self.getMonthLabel, this));
      } else if (binSize === 'month') {
        bars.append('text')
          .attr('transform', 'translate(0,' + (height + 45) + ')')
          .attr('x', function(d) { return x(d.key); })
          .attr('dx', -barWidth/2)
          .style('text-anchor', 'right')
          .classed('axisLabel', true)
          .text(_.bind(self.getYearLabel, this));
      }

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
