function createDemoDrivingScore(vehicleId) {
  const random = Math.random();

  return {
    score: Math.ceil(random * 500) + 400,
    score_max: 1000,
    score_min: 0,
    vehicle_id: vehicleId,
    year: parseInt(moment().subtract(1, 'month').format('YYYY'), 10),
    month: parseInt(moment().subtract(1, 'month').format('M'), 10),
    relative_score_group: [
      {
      	percentile_rank: Math.max(Math.ceil(random * 100) - 30, 10),
      	group_type: 'ALL',
        group_title: 'drivers in the USA'
      },
      {
      	percentile_rank: Math.max(Math.ceil(random * 100) - 20, 15),
      	group_type: 'VEHICLE_SPECIFIC',
        group_title: 'Toyota Prius drivers'
      },
      {
      	percentile_rank: Math.max(Math.ceil(random * 100) - 6, 12),
      	group_type: 'REGION',
        group_title: 'San Francisco Bay Area drivers'
      }
    ],
    score_factors: {
      positive: [
        {
        	title: 'Time spent driving at high speeds',
          description: 'Amount of time spent at high speeds ( >75 mph) or above the speed limit of the road.',
          coaching_text: 'Slow down.',
          unit: '%',
          unit_descriptor: 'of driving time',
          value: Math.round(2 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.5 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers'
        },
        {
        	title: 'Hard braking on urban streets',
          description: 'Average number of hard brakes while driving in urban areas. Hard braking (or hard acceleration)  is a driver event when more force than normal is applied to the vehicle\'s brake or accelerator. It can be an indicator of aggressive or unsafe driving and therefore contributes negatively to the score',
          coaching_text: 'Pay more attention and leave greater distance between your car and the one in front of you.',
          unit: '',
          unit_descriptor: 'hard brakes every 100km',
          value: Math.round(18 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(5 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers'
        }
      ],
      negative: [
        {
        	title: 'Long trips',
          description: 'Number of trips that are long (3+ hrs) or that were somewhat long (1+ hrs) but did not include long enough or frequent enough breaks.',
          coaching_text: 'The Highway Code recommends taking a break (of at least 15 minutes) every two hours. Be more careful when you drive for extended periods of time or try to break your trips into smaller segments.',
          unit: '%',
          unit_descriptor: 'of trips',
          value: Math.round(2.9 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.6 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers '
        },
        {
        	title: 'Highway driving in inclement weather',
          description: 'The total cumulative distance driven on highway roads in inclement weather conditions. Inclement weather conditions include earth, wind and fire.',
          coaching_text: 'Avoid driving in inclement weather.',
          unit: '%',
          unit_descriptor: 'of total driving distance',
          value: Math.round(2 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.3 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers'
        }
      ]
    }
  }
}

function createDemoDrivingScoreHistory(vehicleId) {
  const time = moment().subtract(13, 'month');

  return {
    vehicle_id: vehicleId,
    score_max: 1000,
    score_min: 0,
    score_history: _.range(12).map(function(month) {
      time.add(1, 'month');

      return {
        month: parseInt(time.format('M'), 10),
        year: parseInt(time.format('YYYY'), 10),
        score: Math.ceil(Math.random() * 500) + 400
      };
    })
  }
}

function showNoData() {
  $('#noData').show();
  $('#error').hide();
  $('#results').hide();
}

function showError() {
  $('#error').show();
  $('#noData').hide();
  $('#results').hide();
}

function getDrivingScore(vehicleId, cb) {
  $('#error').hide();
  $('#noData').hide();
  showLoading();

  if (queryParams.demo) {
    return cb(createDemoDrivingScore(vehicleId));
  }

  var accessToken = getAccessToken();
  // TODO: make it point to moxie prod once safe driving score hits production
  var isStaging = window.location.search.indexOf('staging') !== -1;
  var apiUrl = isStaging ? 'https://moxie-stage.automatic.co/safe-driving-score/' : 'https://moxie-stage.automatic.co/safe-driving-score/';
  var vehicleId = $('#vehicleChoice').val();

  $.ajax({
    url: apiUrl,
    data: {
      vehicle_id: vehicleId
    },
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(function(result) {
    console.log(result)
    cb(result);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    hideLoading();
    if (jqXHR.status === 404) {
      showNoData();
    } else {
      showError();
    }
  });
}

function getDrivingScoreHistory(vehicleId, cb) {
  $('#noData').hide();
  $('#error').hide();
  showLoading();

  if (queryParams.demo) {
    return cb(createDemoDrivingScoreHistory(vehicleId));
  }

  var accessToken = getAccessToken();
  // TODO: make it point to moxie prod once safe driving score hits production
  var isStaging = window.location.search.indexOf('staging') !== -1;
  var apiUrl = isStaging ? 'https://moxie-stage.automatic.co/safe-driving-score-history/' : 'https://moxie-stage.automatic.co/safe-driving-score-history/';
  var vehicleId = $('#vehicleChoice').val();

  $.ajax({
    url: apiUrl,
    data: {
      vehicle_id: vehicleId
    },
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(function(result) {
    console.log(result)
    cb(result);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    hideLoading();
    if (jqXHR.status === 404) {
      showNoData();
    } else {
      showError();
    }
  });
}

function renderScoreComponent(component) {
  $('<div>').addClass('col-md-12 pt-4 text-center')
    .append($('<h3>').text(component.title))
    .appendTo('#scoreComponents');

  $('<div>').addClass('col-6 text-center')
    .append($('<div>').addClass('score-group-value').text(`${component.value}${component.unit}`))
    .append($('<div>').addClass('score-group-label').text('You'))
    .appendTo('#scoreComponents');

  $('<div>').addClass('col-6 text-center')
    .append($('<div>').addClass('score-group-value').text(`${component.relative_value}${component.unit}`))
    .append($('<div>').addClass('score-group-label').text(component.relative_value_label))
    .appendTo('#scoreComponents');

  $('<div>').addClass('col-md-12 text-center score-group-unit-label').text(component.unit_descriptor).appendTo('#scoreComponents');

  $('<div>').addClass('col-md-12')
    .append($('<div>').addClass('score-group-description border-bottom').text(component.description))
    .appendTo('#scoreComponents');
}

function renderDrivingScore(data) {
  hideLoading();
  $('#results').fadeIn();
  $('#noData').hide();
  $('#error').hide();

  renderDrivingScoreGraph(data);

  $('<h2>').text('Great job!').appendTo('#scoreResults');
  $('<div>').addClass('pt-3').text(`Your score of ${data.score} puts you ahead of:`).appendTo('#scoreResults');
  $('<div>').addClass('score-item-wrapper').append(data.relative_score_group.map(scoreGroup => {
    return $('<div>').addClass('score-item')
      .append($('<div>').addClass('score-item-value').text(`${scoreGroup.percentile_rank}%`))
      .append($('<div>').addClass('score-item-text').text(` of all ${scoreGroup.group_title}`));
  })).appendTo('#scoreResults');

  $('<div>').addClass('col-md-12')
    .append($('<h2>').text('Score Components - Positive Contributions'))
    .appendTo('#scoreComponents');

  data.score_factors.positive.forEach(renderScoreComponent);

  $('<div>').addClass('col-md-12 mt-4')
    .append($('<h2>').text('Score Components - Negative Contributions'))
    .appendTo('#scoreComponents');

  data.score_factors.negative.forEach(renderScoreComponent);
}

function renderDrivingScoreGraph(data) {
  var wrapper = document.getElementById('scoreGraph');
  var start = 0;
  var end = data.score / data.score_max * 100;

  var colors = {
    fill: '#18B8EA',
    track: '#FFFFFF',
    text: '#18B8EA',
    stroke: '#FFFFFF',
  }

  var radius = 100;
  var border = 20;
  var strokeSpacing = 4;
  var endAngle = Math.PI * 2;
  var boxSize = radius * 2;
  var count = end;
  var progress = start;
  var step = end < start ? -0.01 : 0.01;
  var startAngle = Math.PI;

  // Define the circle
  var circle = d3.arc()
    .startAngle(startAngle)
    .innerRadius(radius)
    .cornerRadius(20)
    .outerRadius(radius - border);

  // Setup SVG wrapper
  var svg = d3.select(wrapper)
    .append('svg')
    .attr('width', boxSize)
    .attr('height', boxSize);

  // Add Group container
  var g = svg.append('g')
    .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

  // Setup track
  var track = g.append('g').attr('class', 'radial-progress');
  track.append('path')
    .attr('class', 'radial-progress__background')
    .attr('fill', colors.track)
    .attr('stroke', colors.stroke)
    .attr('stroke-width', strokeSpacing + 'px')
    .attr('d', circle.endAngle(endAngle));

  // Add color fill
  var value = track.append('path')
    .attr('class', 'radial-progress__value')
    .attr('fill', colors.fill)
    .attr('stroke', colors.stroke)
    .attr('stroke-width', strokeSpacing + 'px');

  // Add text value
  var numberText = track.append('text')
    .attr('class', 'score-graph-text')
    .attr('fill', colors.text)
    .attr('text-anchor', 'middle')
    .attr('dy', '1rem')
    .text(data.score);

  function update(progress) {
    // Update position of endAngle
    value.attr('d', circle.endAngle(startAngle + endAngle * progress));
  }

  (function iterate() {
    // Call update to begin animation
    update(progress);
    if (count > 0) {
      // Reduce count till it reaches 0
      count--;
      // Increase progress
      progress += step;
      // Control the speed of the fill
      setTimeout(iterate, 10);
    }
  })();
}

function renderDrivingScoreHistory(dataHistory) {
  hideLoading();
  renderDrivingScoreHistoryGraph(dataHistory);
}

function renderDrivingScoreHistoryGraph(dataHistory) {
  var wrapper = document.getElementById('scoreHistoryGraph');
  var margin = {top: 10, right: 20, bottom: 50, left: 35};
  var width = wrapper.offsetWidth - margin.left - margin.right;
  var height = Math.min(300, window.innerHeight) - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%m-%Y");

  var bisectDate = d3.bisector(function(d) { return d.date; }).right;

  var graphData = dataHistory.score_history;

  graphData.forEach(function(d) {
    d.date = parseDate(('00' + d.month).slice(-2) + '-' + d.year.toString());
  });

  var xScale = d3.scaleTime()
      .domain(d3.extent(graphData, function(d) { return d.date; }))
      .range([0, width]);

  var yScale = d3.scaleLinear()
      .domain([dataHistory.score_min, dataHistory.score_max])
      .range([height, 0]);

  var line = d3.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return yScale(d.score); })

  var svg = d3.select(wrapper).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const tickCount = Math.min(graphData.length, Math.floor(width / 60));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")).ticks(tickCount));

  svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale).ticks(5));

  svg.append("path")
      .datum(graphData)
      .attr("class", "graph-line")
      .attr("d", line);

  svg.selectAll(".dot")
      .data(graphData)
    .enter().append("circle")
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d) { return xScale(d.date) })
      .attr("cy", function(d) { return yScale(d.score) })
      .attr("r", 9)
        .on("mousemove", mousemove);

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 8.5);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("dx", ".3em");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(graphData, x0, 1),
          d0 = graphData[i - 1],
          d1 = graphData[i] || graphData[i - 1],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.score) + ")");
      focus.select("text").text(d.score).attr("class", "graph-mouseover-text");
    }
}
