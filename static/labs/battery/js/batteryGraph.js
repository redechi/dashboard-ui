var sleepcycles;
var svg;
var x;
var y;
var socType = 'agm'; // indicate that we're starting with agm data

var line = d3.svg.line()
  .x(function(d) { return x(moment(d[1]).toDate()); })
  .y(function(d) { return y(d[0]); })
  .interpolate('linear');

var confidenceInterval = d3.svg.area()
  .interpolate('basis')
  .x(function(d) { return x(moment(d[1]).toDate()); })
  .y0(function(d) { return y(Math.max((d[0] - 10),0)); })
  .y1(function(d) { return y(Math.min((d[0] + 10), 100)); });

function drawBatteryGraph(data) {
  sleepcycles = data.sleep_cycles;

  var margin = {
    top: 80,
    right: 30,
    bottom: 50,
    left: 110
  };

  var width = 800 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // socAgmCycles: array of arrays each with sleep cyc data points. Each array is a
  // cycle, and contains tuples representing its data points.
  // looks like: [[[value, time]. [value, time]],[[value,time],[value,time]]]
  // we're defaulting to soc_agm for initial render
  var socAgmCycles = _.pluck(sleepcycles, 'soc_agm');

  var agmGaps = getGaps(socAgmCycles);

  // doing this to get all the times so we can get our x-axis extent. Probably
  // exists a more efficient way.
  var times = [];
  _.each(socAgmCycles, function(cycle) {
    _.each(cycle, function(point) {
      times.push(moment(point[1]).toDate());
    });
  });

  x = d3.time.scale()
    .domain(d3.extent(times, function(d) { return d; }))
    .range([0, width]);

  y = d3.scale.linear()
    .domain(d3.extent([0,100]))
    .range([height, 0]);

  var node = d3.select('#newBatteryLineGraph');

  // delete existing graph
  node.select('svg').remove();

  svg = node.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(4)
    .orient('left');

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(-50," + (height / 2) + ")rotate(270)")
    .text('Percent Charged');

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.hours, 24)
    .tickFormat(d3.time.format('%_m/%d'))
    .orient('bottom');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .attr('y', 0)
    .attr('dy', '1.5em');

  svg.append("text")
    .attr("class", "axis-label")
    .attr('transform', 'translate(' + (width / 2) + ',' + (height + 50) + ')')
    .text('Date');

  // render initial data vis
  socAgmCycles.forEach(function(cycle) {
    svg.append('path')
      .data([cycle])
      .attr('class', 'ci')
      .attr('d', confidenceInterval);
  });

  agmGaps.forEach(function(gap) {
    svg.append('path')
      .data([gap])
      .attr('class', 'gap-band')
      .attr('d', confidenceInterval);
  });

  // Make a legend
  var gapIconConfig = {
    width: 30,
    height: 30,
    x: 0,
    y: -60
  }

  var cycleIconConfig = {
    width: 30,
    height: 30,
    x: 300,
    y: -60
  }

  var iconLine = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y;});

  var gapIcon = svg.append('rect')
    .attr('x', gapIconConfig.x)
    .attr('y', gapIconConfig.y)
    .attr('height', gapIconConfig.height)
    .attr('width', gapIconConfig.width)
    .attr('class', 'gap-icon');

  var cycleIcon = svg.append('rect')
    .attr('x', cycleIconConfig.x)
    .attr('y', cycleIconConfig.y)
    .attr('height', cycleIconConfig.height)
    .attr('width', cycleIconConfig.width)
    .attr('class', 'cycle-icon');

  gapIconPathData = [
    {
      x: gapIconConfig.x + 1,
      y: gapIconConfig.y + (gapIconConfig.height/2)
    },
    {
      x: gapIconConfig.x + gapIconConfig.width,
      y: gapIconConfig.y + (gapIconConfig.height/2)
    }
  ];

  cycleIconPathData = [
    {
      x: cycleIconConfig.x + 1,
      y: cycleIconConfig.y + (cycleIconConfig.height/2)
    },
    {
      x: cycleIconConfig.x + cycleIconConfig.width,
      y: cycleIconConfig.y + (cycleIconConfig.height/2)
    }
  ];

  svg.append('text')
    .attr('class', 'legend-text')
    .attr('transform', 'translate(' + (gapIconConfig.x + gapIconConfig.width + 10) + ',' + (gapIconConfig.y + gapIconConfig.height - 10) + ')')
    .text('Battery recharging while driving*');

  svg.append('text')
    .attr('class', 'legend-text')
    .attr('transform', 'translate(' + (cycleIconConfig.x + cycleIconConfig.width + 10) + ',' + (cycleIconConfig.y + cycleIconConfig.height - 10) + ')')
    .text('Battery draining while parked');

  // Draw danger rect on top of everything
  svg.append('rect')
    .attr('x', 0.5)
    .attr('y', y(25))
    .attr('width', width)
    .attr('height', y(100 - 24.9))
    .attr('fill', 'rgb(245, 165, 35)')
    .attr('fill-opacity', 0.22);

  // top border of danger rect
  svg.append('rect')
    .attr('x', 0.5)
    .attr('y', y(24.5))
    .attr('width', width)
    .attr('height', 1)
    .attr('fill', 'rgb(245, 165, 35)')
    .attr('fill-opacity', 1);

  svg.append('text')
    .attr('class', 'danger-text')
    .attr('transform', 'translate(' + (width/2) + ',' + y(8) + ')')
    .attr('fill', 'rgb(245, 165, 35)')
    .attr('stroke', 'none')
    .text('Danger Zone');
}

function getGaps(cycles) {
  var gapEndPoints = [];

  for (var i = 1; i < cycles.length; i++) {
    var prevCycle = cycles[i - 1];
    var prevCycleEnd = prevCycle[prevCycle.length - 1];
    var nextCycleStart = cycles[i][0];

    gapEndPoints.push([prevCycleEnd, nextCycleStart]);
  }

  return gapEndPoints;
}

function renderUpdate(newCycles, newGaps) {
  svg.selectAll('.line')
    .data(newCycles)
    .transition()
    .ease('ease-out')
    .duration(300)
    .attr('d', line);

  svg.selectAll('.ci')
    .data(newCycles)
    .transition()
    .ease('ease-out')
    .duration(300)
    .attr('d', confidenceInterval);

  svg.selectAll('.gap')
    .data(newGaps)
    .transition()
    .ease('ease-out')
    .duration(300)
    .attr('d', line);
}

// switch between agm and lead
$('#swapData').click(function(e) {
  e.preventDefault();

  if (socType === 'agm') {
    socType = 'lead';
    var socLeadCycles = _.pluck(sleepcycles, 'soc_lead');
    renderUpdate(socLeadCycles, getGaps(socLeadCycles));

    // change button text
    $('#otherGraphType').text('AGM');
    $('#currentGraphType').text('Lead-Acid');
  } else {
    socType = 'agm';
    var socAgmCycles = _.pluck(sleepcycles, 'soc_agm');
    renderUpdate(socAgmCycles, getGaps(socAgmCycles));

    // change button text
    $('#otherGraphType').text('Lead-Acid');
    $('#currentGraphType').text('AGM');
  }
});
