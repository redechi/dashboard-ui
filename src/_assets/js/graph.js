import _ from 'underscore';
import classNames from 'classnames';
import d3 from 'd3';
import moment from 'moment';

const formatters = require('./formatters');
const highlight = require('./highlight');
const stats = require('./stats');

var binSize;
var bins;
var data;

exports.updateGraph = function(trips, graphType, graphWidth, dateRange) {
  if(!trips) {
    return false;
  }

  //Calculate bin size and graph data
  binSize = calculateBinSize(dateRange);
  bins = calculateBins(dateRange, binSize);
  data = calculateGraphData(trips, graphType, dateRange);
  let summary = calculateGraphSummary(trips, graphType);

  let margin = {top: 35, right: 0, bottom: 60, left: 0};
  let width = graphWidth - margin.left - margin.right;
  let height = 185 - margin.top - margin.bottom;
  let tooltip = document.getElementById('graphTooltip');
  let binWidth = width / data.length;
  let barWidth = Math.min(145, Math.max(8, (width / data.length - 15)));
  let barRadius = Math.min(barWidth/2, 6);
  let minBarHeight = 15;

  //remove any existing graph
  d3.select('.graph .graph-container svg').remove();

  //If no data, no graph
  if(!data || !data.length) {
    return;
  }

  //Update averages
  document.getElementById('graphAverage').innerText = summary.average;

  //Initialize SVG
  let svg = d3.select('.graph .graph-container').append('svg')
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
      .domain([0, d3.max(data, (d) => d.value)]);

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
      .on('mouseenter', barMouseenter)
      .on('mouseleave', barMouseleave)
      .attr('class', (d) => classNames('bar', {selected: d.selected}))
      .attr('y', (d) => y(d.value))
      .attr('x', (d) => x(d.key));

  function generateTooltip(d) {
    let div = '<div class="graph-tooltip-container"><div class="arrow"></div>';
    div += '<div class="date">' + formatGraphLabelDate(parseInt(d.key, 10)) + '</div>';
    div += '<div class="value">' + formatGraphLabelValue(d.value, graphType) + '</div></div>';
    return div;
  }

  function barMouseenter(d) {
    if(d.value === 0) {
      return;
    }

    let startDate = parseInt(d.key, 10);
    let hoveredBin = bins[startDate];
    let magicNumber = 19;
    let top = y(d.value) < (height - minBarHeight) ? (y(d.value) - magicNumber) : (y(d.value) - magicNumber - minBarHeight);

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${x(d.key)}px`;
    tooltip.style.visibility = 'visible';
    tooltip.innerHTML = generateTooltip(d);

    if(hoveredBin) {
      highlight.highlightTrips(hoveredBin.trips);
    }
  }

  function barMouseleave(d) {
    tooltip.style.visibility = 'hidden';

    highlight.unhighlightTrips();
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
    .attr('class', 'invisible-hover')
    .attr('x', (d) => x(d.key) - (barWidth/2))
    .attr('y', height - minBarHeight)
    .attr('width', barWidth)
    .attr('height', minBarHeight);


  bars.append('path')
    .attr('class', 'bar-background')
    .attr('d', (d) => {
      if(d.value > 0) {
        return topRoundedRectBackground(x(d.key) - (barWidth/2), y(d.value), barWidth, height - y(d.value), barRadius);
      }
    });

  bars.append('path')
    .attr('class', 'bar-outline')
    .attr('d', (d) => {
      if(d.value > 0) {
        return topRoundedRectBorder(x(d.key) - (barWidth/2), y(d.value), barWidth, height - y(d.value), barRadius);
      }
    })
    .style('stroke', (d) => {
      //color each outline by score
      if(graphType === 'score') {
        return formatters.scoreColor(d.value);
      }
    });


  //styles for min and max
  if(summary.barCount > 2) {
    let maxBar = getBarByKey(summary.max.key);

    maxBar
      .classed('max', true)
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.value))
        .attr('dy', '-1.75em')
        .text('MAX')
        .attr('text-anchor', 'middle')
        .attr('class', 'bar-label');

    maxBar
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.value))
        .attr('dy', '-0.55em')
        .text((d) => formatGraphLabelValue(d.value, graphType))
        .attr('text-anchor', 'middle');

    let minBar = getBarByKey(summary.min.key);

    minBar
      .classed('min', true)
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.value))
        .attr('dy', '-1.75em')
        .text('MIN')
        .attr('text-anchor', 'middle')
        .attr('class', 'bar-label');

    minBar
      .append('text')
        .attr('x', (d) => x(d.key))
        .attr('y', (d) => y(d.value))
        .attr('dy', '-0.55em')
        .text((d) => formatGraphLabelValue(d.value, graphType))
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


  //X Axis box to hide small value of graph
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
    .attr('class', (d) => (d.value === 0) ? 'empty' : '')
    .classed('tickLabel', true)
    .text(_.bind(getTickLabel, this));

  //Month and Year Labels
  if(binSize === 'day') {
    bars.append('text')
      .attr('transform', 'translate(0,' + (height + 40) + ')')
      .attr('x', (d) => x(d.key))
      .attr('dx', -barWidth/2)
      .classed('axisLabel', true)
      .text(_.bind(getMonthLabel, this));
  } else if (binSize === 'month') {
    bars.append('text')
      .attr('transform', 'translate(0,' + (height + 45) + ')')
      .attr('x', (d) => x(d.key))
      .attr('dx', -barWidth/2)
      .classed('axisLabel', true)
      .text(_.bind(getYearLabel, this));
  }
};

exports.highlightTrips = function(trips) {
  trips.forEach(trip => {
    let key = moment(trip.started_at).startOf(binSize).valueOf();
    getBarByKey(key.toString()).classed('highlighted', true);
  });
};

exports.unhighlightTrips = function(trips) {
  trips.forEach(trip => {
    let key = moment(trip.started_at).startOf(binSize).valueOf();
    getBarByKey(key.toString()).classed('highlighted', false);
  });
};

function calculateAverage(trips, graphType) {
  if(!trips) {
    return;
  }

  let average;
  if(graphType === 'mpg' || graphType === 'score') {
    average = stats.sumTrips(trips, graphType);
  } else {
    average = stats.sumTrips(trips, graphType) / _.size(bins);
  }
  return formatGraphLabelValue(average, graphType);
}

function calculateGraphData(trips, graphType, dateRange) {
  //group trips into bins
  trips.forEach((trip) => {
    let bin = bins[moment(trip.started_at).startOf(binSize).valueOf()];
    if(bin) {
      bin.trips.push(trip);
      if(trip.selected) {
        bin.selected = true;
      }
    }
  });

  //Combine trips into one number
  return _.map(bins, (bin, key) => ({
    key: key,
    value: stats.sumTrips(bin.trips, graphType),
    selected: bin.selected
  }));
}

function calculateGraphSummary(trips, graphType) {
  //Calculate Min and Max and Empty bins
  let summary = _.reduce(data, (memo, bar) => {
    if ((!memo.max || bar.value >= memo.max.value) && bar.value > 0) {
      memo.max = bar;
    }
    if ((!memo.min || bar.value <= memo.min.value) && bar.value > 0) {
      memo.min = bar;
    }
    if (bar.value > 0) {
      memo.barCount++;
    }
    return memo;
  }, {barCount: 0});

  summary.average = calculateAverage(trips, graphType);

  return summary;
}

function calculateBinSize(dateRange) {
  let days = moment.duration(dateRange[1] - dateRange[0]).asDays();

  if(days <= 42) {
    //use days as bin
    return 'day';
  } else {
    //use months as bin
    return 'month';
  }
}

function calculateBins(dateRange, binSize) {
  let binDate = dateRange[0];
  let bins = {};

  while(binDate < dateRange[1]) {
    let bin = moment(binDate).startOf(binSize).valueOf()
    bins[bin] = {
      trips: [],
      bin: bin
    };
    binDate = moment(binDate).add(1, binSize).valueOf();
  }
  return bins;
}

function getTickLabel(d) {
  if(binSize === 'month') {
    return moment(parseInt(d.key, 10)).format('MMM');
  } else if(binSize === 'day') {
    if(data.length <= 60) {
      return moment(parseInt(d.key, 10)).format('D');
    } else if(data.length <= 120) {
      //Only return odd days
      let day = moment(parseInt(d.key, 10)).format('D');
      return (day % 2 === 1) ? day : '';
    }
  }
}

function getMonthLabel(d) {
  let date = moment(parseInt(d.key, 10));
  let firstDate = _.first(data).key;
  let lastDate = _.last(data).key;

  if((date.date() === 1 && d.key < lastDate) || (d.key === firstDate && date.date() < 29)) {
    //only show month label at start of months (if more than one day of that month is shown) and first position
    return date.format('MMM \'YY');
  }
}

function getYearLabel(d) {
  let date = moment(parseInt(d.key, 10));
  if(date.month() === 0 || (d.key === data[0].key && date.date() < 29)) {
    //only show year label at start of years and first position
    return date.format('YYYY');
  }
}

function getBarByKey(key) {
  return d3.select('.graph .graph-container svg')
    .selectAll('.bar')
      .filter(d => d.key === key);
}

function formatGraphLabelDate(date) {
  if(binSize === 'day') {
    return moment(date).format('MMM D');
  } else if(binSize === 'month') {
    return moment(date).format('MMM YYYY');
  }
}

function formatGraphLabelValue(value, graphType) {
  if(graphType === 'cost') {
    return formatters.costWithUnit(value);
  } else if (graphType === 'score') {
    return formatters.score(value);
  } else if (graphType === 'duration') {
    return formatters.durationMinutes(value);
  } else if (graphType === 'mpg') {
    return formatters.averageMPG(value);
  } else if (graphType === 'distance') {
    return formatters.distance(value);
  }
}
