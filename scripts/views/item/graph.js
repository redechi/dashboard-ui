define([
  'backbone',
  'communicator',
  '../../collections/filters',
  'hbs!tmpl/item/graph_tmpl',
  'controllers/stats',
  'controllers/unit_formatters',
  'controllers/analytics',
  'd3',
  'nvd3'
],
function( Backbone, coms, filters, GraphTmpl, stats, formatters, analytics, d3, nvd3 ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    model: new Backbone.Model({
      values: [],
      graphType: 'average_mpg',
      graphTypeName: 'MPG',
      graphTypeUnit: 'MPG'
    }),
    tagName: 'div',
    collection: new Backbone.Collection(),
    template: GraphTmpl,


    events: {
      'click .graphValue li': 'changeGraphType'
    },


    selectedTrips: {},

    initialize: function(model) {
      coms.on('resize', _.bind(this.makeGraph, this));
      coms.on('filter', _.bind(this.resetCollection, this));
      coms.on('trips:highlight', _.bind(this.highlightTrips, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightTrips, this));
      coms.on('trips:select', _.bind(this.selectTrip, this));
      coms.on('trips:deselect', _.bind(this.deselectTrip, this));
    },


    resetCollection: function (collection) {
      this.collection.reset(collection);
      this.getGraphData();
      this.makeGraph();
      this.setDateRange();
    },


    highlightTrips: function (trips) {
      var self = this;

      trips.forEach(function(model) {
        var id = model.get('id'),
            binSize = self.model.get('binSize'),
            start_time = model.get('start_time'),
            key = moment(start_time).startOf(binSize).valueOf();

        //highlight bar
        self.getBarByKey(key.toString()).classed('highlighted', true);
      });
    },


    unhighlightTrips: function (trips) {
      var self = this;

      trips.forEach(function(model) {
        var id = model.get('id'),
            binSize = self.model.get('binSize'),
            start_time = model.get('start_time'),
            key = moment(start_time).startOf(binSize).valueOf();

        self.getBarByKey(key.toString()).classed('highlighted', false);
      });
    },


    selectTrip: function (model) {
      var id = model.get('id'),
          binSize = this.model.get('binSize'),
          start_time = model.get('start_time'),
          key = moment(start_time).startOf(binSize).valueOf();

      //select bar
      this.getBarByKey(key.toString())
        .classed('selected', true);

      //if selected, add to list
      if(model.get('selected')) {
        if(!this.selectedTrips[key]) {
          this.selectedTrips[key] = {};
        }
        this.selectedTrips[key][id] = true;
      }
    },


    deselectTrip: function (model) {
      var id = model.get('id'),
          binSize = this.model.get('binSize'),
          start_time = model.get('start_time'),
          key = moment(start_time).startOf(binSize).valueOf();

      if(this.selectedTrips[key]) {
        delete this.selectedTrips[key][id];
      }

      //don't deselect bar if has selected trips
      if(!_.size(this.selectedTrips[key])) {
        this.getBarByKey(key.toString())
          .classed('selected', false);
      }
    },


    getBarByKey: function(key) {
      return d3.select('#graphs .graphContainer svg')
        .selectAll('.bar')
          .filter(function(d) { return d.key === key; });
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

      if(days <= 42) {
        //use days as bin
        binSize = 'day';
      } else {
        //use months as bin
        binSize = 'month';
      }

      this.model.set('binSize', binSize);

      while(date < dateRange[1]) {
        bins[moment(date).startOf(binSize).valueOf()] = [];
        date = moment(date).add(1, binSize + 's').valueOf();
      }


      //group trips into bins
      this.collection.each(function(trip) {
        var bin = moment(trip.get('start_time')).startOf(binSize).valueOf();
        if(bins[bin]) {
          bins[bin].push(trip);
        }
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
        if(bar.values > 0) {
          memo.barCount++;
        }
        return memo;
      }, {barCount: 0});

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
      return Math.min(145, Math.max(8, (width / data.length - 15)));
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
          margin = {top: 35, right: 0, bottom: 60, left: 0},
          outerWidth = $('#graphs').width(),
          width = outerWidth - margin.left - margin.right,
          height = 185 - margin.top - margin.bottom,
          tooltip = $('#graphs .graphContainer .graphTooltipContainer'),
          binWidth = width / data.length,
          barWidth = this.getBarWidth(data, width),
          barRadius = Math.min(barWidth/2, 6),
          minBarHeight = 15;


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
          .classed(graphType, true)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //SVG defs for gradient
      this.appendSVGGradient(svg.append('svg:defs'));
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

      svg.append('g')
        .attr('class', 'grid')
        .call(yAxis);


      //Draw bars
      var bars = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
          .attr('class', 'bar')
          .attr('y', function(d) { return y(d.values); })
          .attr('x', function(d) { return x(d.key); });


      function generateTooltip(d) {
        var tooltip = '<div class="arrow"></div>';
        tooltip += '<div class="date">' + formatters.formatDateForGraphLabel(binSize, parseInt(d.key, 10)) + '</div>';
        tooltip += '<div class="value">' + formatters.formatForGraphLabel(graphType, d.values) + '</div>';
        return tooltip;
      }


      function barMouseover(d) {
        if(d.values === 0) { return; }

        var startDate = parseInt(d.key, 10),
            endDate = moment(startDate).endOf(binSize).valueOf();
        coms.trigger('trips:highlightByDate', startDate, endDate);

        var magicNumber = 19,
            top = y(d.values) < (height - minBarHeight) ? (y(d.values) - magicNumber) : (y(d.values) - magicNumber - minBarHeight);
        tooltip
          .css({
            top: top + 'px',
            left: x(d.key) + 'px',
            visibility: 'visible'
          })
          .find('.graphTooltip')
            .html(generateTooltip(d));
      }

      function barMouseout(d) {
        if(d.values === 0) { return; }

        var startDate = parseInt(d.key, 10),
            endDate = moment(startDate).endOf(binSize).valueOf();
        coms.trigger('trips:unhighlightByDate', startDate, endDate);

        tooltip.css('visibility', 'hidden');
      }

      //draw background separately from border to allow missing bottom border
      function topRoundedRectBackground(x, y, width, height, radius) {
        return 'M' + (x + radius) + ',' + y
             + 'h' + (width - (2 * radius))
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius
             + 'v' + (height - radius)
             + 'h' + (-width)
             + 'v' + (radius - height)
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + (-radius)
             + 'z';
      }

      function topRoundedRectBorder(x, y, width, height, radius) {
        return 'M' + (x + radius) + ',' + y
             + 'h' + (width - (2 * radius))
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius
             + 'v' + (height - radius)
             + 'm' + (-width) + ',' + 0
             + 'v' + (radius - height)
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + (-radius);
      }

      //invisible bar to make tooltip hovering easier
      bars.append('rect')
        .on('mouseover', barMouseover)
        .on('mouseout', barMouseout)
        .attr('class', 'invisibleHover')
        .attr('x', function(d) { return x(d.key) - (barWidth/2); })
        .attr('y', height - minBarHeight)
        .attr('width', barWidth)
        .attr('height', minBarHeight);


      bars.append('path')
        .on('mouseover', barMouseover)
        .on('mouseout', barMouseout)
        .attr('class', 'barBackground')
        .attr('d', function(d) {
          if(d.values > 0) {
            return topRoundedRectBackground(x(d.key) - (barWidth/2), y(d.values), barWidth, height - y(d.values), barRadius);
          }
        });

      bars.append('path')
        .on('mouseover', barMouseover)
        .on('mouseout', barMouseout)
        .attr('class', 'barOutline')
        .attr('d', function(d) {
          if(d.values > 0) {
            return topRoundedRectBorder(x(d.key) - (barWidth/2), y(d.values), barWidth, height - y(d.values), barRadius);
          }
        })
        .style('stroke', function(d) {
          //color each outline by score
          if(graphType === 'score') {
            return formatters.scoreColor(d.values);
          }
        });


      //styles for min and max
      if(summary.barCount > 2) {
        var maxBar = this.getBarByKey(summary.max.key);

        maxBar
          .classed('max', true)
          .append('text')
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

        var minBar = this.getBarByKey(summary.min.key);

        minBar
          .classed('min', true)
          .append('text')
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


      //X Axis line
      svg.append('g')
        .attr('class', 'x axis')
        .append('line')
          .attr('x1', 0)
          .attr('y1', height)
          .attr('x2', width)
          .attr('y2', height);


      //X Axis box to hide small values of graph
      svg.append('g')
        .attr('class', 'x axis background')
        .append('rect')
          .attr('x', 0)
          .attr('y', height + 1)
          .attr('width', width)
          .attr('height', 8);


      //X Axis labels
      bars.append('text')
        .attr('transform', 'translate(0,' + (height + 20) + ')')
        .attr('x', function(d) { return x(d.key); })
        .attr('class', function(d) {return (d.values === 0) ? 'empty' : ''; })
        .classed('tickLabel', true)
        .text(_.bind(self.getTickLabel, this));

      //Month and Year Labels
      if(binSize === 'day') {
        bars.append('text')
          .attr('transform', 'translate(0,' + (height + 40) + ')')
          .attr('x', function(d) { return x(d.key); })
          .attr('dx', -barWidth/2)
          .classed('axisLabel', true)
          .text(_.bind(self.getMonthLabel, this));
      } else if (binSize === 'month') {
        bars.append('text')
          .attr('transform', 'translate(0,' + (height + 45) + ')')
          .attr('x', function(d) { return x(d.key); })
          .attr('dx', -barWidth/2)
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

      $('.graphValue li', this.$el).removeClass();
      $('.graphValue li[data-value="' + graphType + '"]', this.$el).addClass('selected');

      $('.graphType', this.$el).popover('hide');
      $('.graphType span', this.$el).text(graphTypeName);

      analytics.trackEvent('graph type', 'Change', graphTypeName);

      this.getGraphData();
      this.makeGraph();
    },


    setDateRange: function() {
      var dateRange = filters.findWhere({name: 'date'}).get('value');
      $('.dateRange', this.$el).text(formatters.dateRange(dateRange));
    },


    createGraphPopover: function() {
      $('.graphType', this.$el)
        .popover('destroy')
        .popover({
          html: true,
          content: function() { return $('.graphMenu .popoverTemplate', this.$el).html(); },
          title: 'Choose Metric',
          placement: 'bottom',
          viewport: 'body>main'
        });
    },


    onShow: function() {
      this.createGraphPopover();
    }

  });
});
