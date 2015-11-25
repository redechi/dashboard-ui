import _ from 'underscore';
import d3 from 'd3';
import moment from 'moment';

const formatters = require('./formatters');
const stats = require('./stats');

let binSize;
let bins = {};
let data;
let summary


exports.updateGraph = function(trips, graphType) {
  if(!trips) {
    return false;
  }

  getGraphData(trips, graphType);

  let margin = {top: 35, right: 0, bottom: 60, left: 0};
  let outerWidth = $('.graph').width();
  let width = outerWidth - margin.left - margin.right;
  let height = 185 - margin.top - margin.bottom;
  let tooltip = $('.graph .graph-container .graph-tooltip-container');
  let binWidth = width / data.length;
  let barWidth = Math.min(145, Math.max(8, (width / data.length - 15)));
  let barRadius = Math.min(barWidth/2, 6);
  let minBarHeight = 15;

  //remove any existing graph
  d3.select('.graphs .graph-container svg').remove();

  //If no data, no graph
  if(!data || !data.length) {
    return;
  }

  //Initialize SVG
  let svg = d3.select('#graphs .graphContainer').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .classed(graphType, true)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //scales
  let x = d3.scale.linear()
      .range([0, width - (binWidth / 2)])
      .domain([
        parseInt(d3.min(data, (d) => d.key), 10) - moment.duration(0.5, binSize + 's').valueOf(),
        parseInt(d3.max(data, (d) => d.key), 10)
      ]);

  let y = d3.scale.linear()
      .range([height, 0])
      .domain([0, d3.max(data, (d) => d.values)]);

  //axes
  let yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(5)
      .tickSize(-width, 0, 0)
      .tickFormat('');

  svg.append('g')
    .attr('class', 'grid')
    .call(yAxis);

  //Draw bars
  let bars = svg.selectAll('.bar')
    .data(data)
    .enter().append('g')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.values))
      .attr('x', (d) => x(d.key));

  function generateTooltip(d) {
    let tooltip = '<div class="arrow"></div>';
    tooltip += '<div class="date">' + formatters.formatDateForGraphLabel(binSize, parseInt(d.key, 10)) + '</div>';
    tooltip += '<div class="value">' + formatters.formatForGraphLabel(graphType, d.values) + '</div>';
    return tooltip;
  }

  function barMouseover(d) {
    if(d.values === 0) {
      return;
    }

    let startDate = parseInt(d.key, 10);
    let endDate = moment(startDate).endOf(binSize).valueOf();
    let magicNumber = 19;
    let top = y(d.values) < (height - minBarHeight) ? (y(d.values) - magicNumber) : (y(d.values) - magicNumber - minBarHeight);

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
    if(d.values === 0) {
      return;
    }

    let startDate = parseInt(d.key, 10);
    let endDate = moment(startDate).endOf(binSize).valueOf();

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
    .attr('x', (d) => x(d.key) - (barWidth/2))
    .attr('y', height - minBarHeight)
    .attr('width', barWidth)
    .attr('height', minBarHeight);


  bars.append('path')
    .on('mouseover', barMouseover)
    .on('mouseout', barMouseout)
    .attr('class', 'barBackground')
    .attr('d', (d) => {
      if(d.values > 0) {
        return topRoundedRectBackground(x(d.key) - (barWidth/2), y(d.values), barWidth, height - y(d.values), barRadius);
      }
    });

  bars.append('path')
    .on('mouseover', barMouseover)
    .on('mouseout', barMouseout)
    .attr('class', 'barOutline')
    .attr('d', (d) => {
      if(d.values > 0) {
        return topRoundedRectBorder(x(d.key) - (barWidth/2), y(d.values), barWidth, height - y(d.values), barRadius);
      }
    })
    .style('stroke', (d) => {
      //color each outline by score
      if(graphType === 'score') {
        return formatters.scoreColor(d.values);
      }
    });


  //styles for min and max
  if(summary.barCount > 2) {
    let maxBar = this.getBarByKey(summary.max.key);

    maxBar
      .classed('max', true)
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.values))
        .attr('dy', '-1.75em')
        .text('MAX')
        .attr('text-anchor', 'middle')
        .attr('class', 'barLabel');

    maxBar
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.values))
        .attr('dy', '-0.55em')
        .text((d) => formatters.formatForGraphLabel(graphType, d.values))
        .attr('text-anchor', 'middle');

    let minBar = this.getBarByKey(summary.min.key);

    minBar
      .classed('min', true)
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.values))
        .attr('dy', '-1.75em')
        .text('MIN')
        .attr('text-anchor', 'middle')
        .attr('class', 'barLabel');

    minBar
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.values))
        .attr('dy', '-0.55em')
        .text((d) => formatters.formatForGraphLabel(graphType, d.values))
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
    .attr('x', (d) => x(d.key))
    .attr('class', (d) => (d.values === 0) ? 'empty' : '')
    .classed('tickLabel', true)
    .text(_.bind(self.getTickLabel, this));

  //Month and Year Labels
  if(binSize === 'day') {
    bars.append('text')
      .attr('transform', 'translate(0,' + (height + 40) + ')')
      .attr('x', (d) => x(d.key))
      .attr('dx', -barWidth/2)
      .classed('axisLabel', true)
      .text(_.bind(self.getMonthLabel, this));
  } else if (binSize === 'month') {
    bars.append('text')
      .attr('transform', 'translate(0,' + (height + 45) + ')')
      .attr('x', (d) => x(d.key))
      .attr('dx', -barWidth/2)
      .classed('axisLabel', true)
      .text(_.bind(self.getYearLabel, this));
  }
};


function getGraphData(trips, graphType) {
  //TODO: connect to filters
  let dateRange = [1414825200000, 1448440274038];
  let date = dateRange[0];

  //Calculate bin size
  let days = moment.duration(dateRange[1] - dateRange[0]).asDays();

  if(days <= 42) {
    //use days as bin
    binSize = 'day';
  } else {
    //use months as bin
    binSize = 'month';
  }

  while(date < dateRange[1]) {
    bins[moment(date).startOf(binSize).valueOf()] = [];
    date = moment(date).add(1, binSize + 's').valueOf();
  }

  //group trips into bins
  trips.forEach((trip) => {
    let bin = moment(trip.started_at).startOf(binSize).valueOf();
    if(bins[bin]) {
      bins[bin].push(trip);
    }
  });

  //Combine trips into one number
  data = _.map(bins, (trips, key) => ({
    key: key,
    values: stats.sumTrips(trips, graphType)
  }));

  //Calculate Min and Max and Empty bins
  summary = _.reduce(data, (memo, bar) => {
    if ((!memo.max || bar.values >= memo.max.values) && bar.values > 0) {
      memo.max = bar;
    }
    if ((!memo.min || bar.values <= memo.min.values) && bar.values > 0) {
      memo.min = bar;
    }
    if (bar.values > 0) {
      memo.barCount++;
    }
    return memo;
  }, {barCount: 0});
}
