var sampleData = JSON.parse(window.dangerData);

var margin = {
  top: 20,
  right: 10,
  bottom: 120,
  left: 80
};

var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var sleepCycles = sampleData.sleep_cycles;

// these variables will hold the two kinds of data. We'll store it there so that
// it doesn't have to be remunged every time the user wants to switch between
// lead/agm
var socAgmCycles;
var socLeadCycles;

// socAgmCycles: array of arrays each with sleep cyc data points. Each array is a
// cycle, and contains tuples representing its data points.
// looks like: [[[value, time]. [value, time]],[[value,time],[value,time]]]
// we're defaulting to soc_agm for initial render
socAgmCycles = sleepCycles.map(function(cycle) {
  return cycle.soc_agm;
});

// take only five cycles
socAgmCycles = socAgmCycles.slice(0,5);

// doing this to get all the times so we can get our x-axis extent. Probably
// exists a more efficient way.
var times = [];
_.each(socAgmCycles, function(cycle) {
  _.each(cycle, function(point) {
    times.push(moment(point[1]).toDate());
  });
});

var x = d3.time.scale()
  .domain(d3.extent(times, function(d) { return d; }))
  .range([0, width]);

var y = d3.scale.linear()
  .domain(d3.extent([0,100]))
  .range([height, 0]);


var node = d3.select('#newBatteryLineGraph');
var svg = node.append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// draws the gap-bands. Drawing here for svg layering. Should be behind
// everything, including danger zone and the actual gap lines.
var agmGaps = getGaps(socAgmCycles);
drawGapBands(agmGaps);

// draws the danger rect. This is way up here so that it's behind everything from
// being painted first
dangerZone();

// add Archer image
svg.append('svg:image')
  .attr('xlink:href', './archer.png')
  .attr('width', 106)
  .attr('height', 106)
  .attr('y', y(0) - 106)
  .attr('x', width - 126);

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
  .text('State of Charge (%)');


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
  //.attr('x', 9);
  .attr('dy', '1.5em');
  //.attr('transform', 'rotate(-45)')
  //.style('text-anchor', 'end');


var line = d3.svg.line()
  .x(function(d) { return x(moment(d[1]).toDate()); })
  .y(function(d) { return y(d[0]); })
  .interpolate('linear');

var confidenceInterval = d3.svg.area()
  .interpolate('basis')
  .x(function(d) { return x(moment(d[1]).toDate()); })
  .y0(function(d) { return y(Math.max((d[0] - 10),0)); })
  .y1(function(d) { return y(Math.min((d[0] + 10), 100)); });

function drawCycle(sleepcycles) {
  svg.append('path')
    .data(sleepcycles)
    .attr('class', 'ci')
    .attr('d', confidenceInterval);

  svg.append('path')
    .data(sleepcycles)
    .attr('class', 'line')
    .attr('d', line);


}

// render initial data vis
for (var i = 0; i < socAgmCycles.length; i++) {
  drawCycle([socAgmCycles[i]]);
}


/* fill in the gaps, ie draw the dotted lines */

function getGaps(cycles) {

  var gapEndPoints = [];

  for (var i = 1; i < cycles.length; i++) {
    prevCycle = cycles[i - 1];
    prevCycleEnd = prevCycle[prevCycle.length - 1];
    nextCycleStart = cycles[i][0];

    gapEndPoints.push([prevCycleEnd, nextCycleStart]);
  }

  return gapEndPoints;
}

function drawGap(gap) {
  svg.append('path')
    .data(gap)
    .attr('class', 'gap line')
    .attr('d', line);
}


function drawGapBands(gaps) {
  for (var i = 0; i < gaps.length; i++) {
    svg.append('rect')
      .attr('x', x(moment(gaps[i][0][1]).toDate()))
      .attr('y', y(100))
      .attr('width', x(moment(gaps[i][1][1]).toDate()) - x(moment(gaps[i][0][1]).toDate()))
      .attr('height', height)
      .attr('class', 'gap-band');
  }
}

function drawGaps(gaps) {
  for (var i = 0; i < gaps.length; i++) {
    drawGap([gaps[i]]);
  }
}

// define both now so we can assign to them later and hold values in memory
var agmGaps;
var leadGaps;

//agmGaps = getGaps(socAgmCycles);
drawGaps(agmGaps);


// will create a red-striped box at bottom that says 'danger zone'
function dangerZone() {
  // pattern gives a striped pattern. Not being used right now
  var pattern = svg.append('defs')
    .append('pattern')
    .attr('id', 'dangerPattern')
    .attr('width', 6)
    .attr('height', 6)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('patternTransform', 'rotate(45)');

  pattern
    .append('rect')
    .attr('width', 3)
    .attr('height', 6)
    .attr('transform', 'translate(0,0)')
    .attr('fill', 'red');

  pattern
    .append('rect')
    .attr('width', 6)
    .attr('height', 6)
    .attr('fill', 'red')
    .attr('fill-opacity', 0.5);

  svg.append('rect')
    .attr('x', 0.5)
    .attr('y', y(25))
    .attr('width', width)
    .attr('height', y(100 - 24.9))
    .attr('fill', '#EFD780')
    .attr('fill-opacity', 0.8);

  svg.append('text')
    .attr('class', 'danger-text')
    .attr('transform', 'translate(' + (((width - margin.left)/2) - margin.left) + ',' + y(8) + ')')
    .attr('fill', '#F2A647')
    .attr('stroke', 'none')
    .text('Danger Zone');

}

// indicate that we're starting with agm data
var socType = 'agm';

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

// Make a legend
var gapIconConfig = {
  width: 30,
  height: 30,
  x: margin.left,
  y: height + (margin.bottom / 2)
}

var cycleIconConfig = {
  width: 30,
  height: 30,
  x: margin.left * 5,
  y: height + (margin.bottom / 2)
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

svg.append('path')
  .data([gapIconPathData])
  .attr('class', 'gap line')
  .attr('d', iconLine);

svg.append('path')
  .data([cycleIconPathData])
  .attr('class', 'line')
  .attr('d', iconLine);

svg.append('text')
  .attr('class', 'legend-text')
  .attr('transform', 'translate(' + (gapIconConfig.x + gapIconConfig.width + 10) + ',' + (gapIconConfig.y + gapIconConfig.height - 10) + ')')
  .text('Car is driving and recharging');

svg.append('text')
  .attr('class', 'legend-text')
  .attr('transform', 'translate(' + (cycleIconConfig.x + cycleIconConfig.width + 10) + ',' + (cycleIconConfig.y + cycleIconConfig.height - 10) + ')')
  .text('Car is parked and draining battery');


// switch between agm and lead

$('#swapData').click(function(e) {
  e.preventDefault();

  if (socType === 'agm') {
    socType = 'lead';
    if (typeof socLeadCycles === 'undefined') {
      socLeadCycles = sleepCycles.map(function(cycle) {
        return cycle.soc_lead;
      });
      socLeadCycles = socLeadCycles.slice(0,5);
    }
    if (typeof leadGaps === 'undefined') {
      leadGaps = getGaps(socLeadCycles);
    }
    renderUpdate(socLeadCycles, leadGaps);

    // change button text
    $('#otherGraphType').text('AGM');
    $('#currentGraphType').text('Lead-Acid');
  } else {
    socType = 'agm';
    renderUpdate(socAgmCycles, agmGaps);

    // change button text
    $('#otherGraphType').text('Lead-Acid');
    $('#currentGraphType').text('AGM');
  }
});
