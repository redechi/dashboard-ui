define([
  'backbone',
  'communicator',
  '../../collections/filters',
  'hbs!tmpl/item/graph_tmpl',
  'controllers/unit_formatters'
],
function( Backbone, coms, filters, GraphTmpl, formatters ) {
    'use strict';

  var BarChart = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    model: new Backbone.Model({values:[], graphType:'No Data'}),
    collection: new Backbone.Collection(),
    template: GraphTmpl,

    collectionEvents: {},

    events: {
      'click .graphValue li': 'changeGraphType'
    },

    initialize: function(model) {
      console.log('initialize a Graph ItemView');
      this.model.set('graphType', 'average_mpg');
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    resetCollection: function (collection) {
      this.collection.reset(collection);

      this.getGraphData();
      this.makeGraph();
      this.setDateRange();
    },


    getGraphData: function () {
      var graphType = this.model.get('graphType');

      var bins = d3.nest()
        .key(function(d) { return d.start_time; })
        .rollup(function(d) {
          return d3.sum(d, function(g) { return g[graphType]; })
        })
        .entries(this.collection.toJSON())
        .reverse();



      this.model.set('values', bins);
    },


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


    makeGraph: function() {
      var data = this.model.get('values'),
          dateRange = filters.findWhere({name: 'date'}).get('value'),
          margin = {top: 10, right: 30, bottom: 90, left: 30},
          width = 880 - margin.left - margin.right,
          height = 225 - margin.top - margin.bottom;

      d3.select('#graphs .graphContainer svg').remove();

      var tooltip = d3.select('#graphs .graphContainer .graphTooltip');

      var svg = d3.select('#graphs .graphContainer').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      console.log(data)

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], 0.1)
          .domain(data.map(function(d) { return d.key; }));

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, d3.max(data, function(d) { return d.values; })]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .tickFormat(function(d) { return moment(d).format('MMM D'); });

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(5)
          .tickSize(-width, 0, 0)
          .tickFormat('');

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', function() { return 'rotate(-65)'; });

      svg.selectAll('.x.axis').append('line')
        .attr('class', 'bottom')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0);

      svg.append('g')
        .attr('class', 'grid')
        .call(yAxis);

      svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
          .attr('class', 'bar');

      function tooltipMouseover(d) {
        tooltip
          .style('visibility', 'visible')
          .html('<div class="date">' + moment(d.key).format('MMM D') + '</div><div class="value">' + d.values.toFixed(1) + '</div>');
      }

      function topRoundedRect(x, y, width, height, radius) {
        return 'M' + (x + radius) + ',' + y
             + 'h' + (width - 2 * radius)
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius
             + 'v' + (height - 2 * radius)
             + 'v' + radius
             + 'h' + (-radius)
             + 'h' + (2 * radius - width)
             + 'h' + (-radius)
             + 'v' + (-radius)
             + 'v' + (2 * radius - height)
             + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + (-radius)
             + 'z';
      }

      svg.selectAll('.bar').append('path')
        .attr('x', function(d) { return x(d.key); })
        .attr('y', function(d) { return y(d.values); })
        .attr('height', function(d) { return height - y(d.values); })
        .attr('width',  x.rangeBand())
        .on('mouseover', tooltipMouseover)
        .on('mousemove', function(){ tooltip.style('top', (event.offsetY-10)+'px').style('left',(event.offsetX+10)+'px');})
        .on('mouseout', function(){ tooltip.style('visibility', 'hidden');})
        .attr('d', function(d) {
          return topRoundedRect(x(d.key), y(d.values), x.rangeBand(), height - y(d.values), 10);
        });
    },


    changeGraphType: function (e) {
      var graphType = $(e.currentTarget).data('value');
      this.model.set('graphType', graphType);

      this.getGraphData();
      this.makeGraph();
    },


    setDateRange: function() {
      var dateRange = filters.findWhere({name: 'date'}).get('value');
      $('#graphs .dateRange').text(formatters.dateRange(dateRange));
    },


    onRender: function() {
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
