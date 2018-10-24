function createDemoDrivingScore(vehicleId) {
  const random = Math.random()

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
      	percentile_rank: Math.max(Math.ceil(random * 100) - 22, 20),
      	group_type: 'VEHICLE_CATEGORY',
        group_title: 'hybrid drivers'
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
          unit_label: 'of driving time',
          value: Math.round(2 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.5 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers'
        },
        {
        	title: 'Hard braking on urban streets',
          description: 'Average number of hard brakes while driving in urban areas. Hard braking (or hard acceleration)  is a driver event when more force than normal is applied to the vehicle\'s brake or accelerator. It can be an indicator of aggressive or unsafe driving and therefore contributes negatively to the score',
          coaching_text: 'Pay more attention and leave greater distance between your car and the one in front of you.',
          unit: '',
          unit_label: 'hard brakes every 100km',
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
          unit_label: 'of trips',
          value: Math.round(2.9 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.6 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers '
        },
        {
        	title: 'Highway driving in inclement weather',
          description: 'The total cumulative distance driven on highway roads in inclement weather conditions. Inclement weather conditions include earth, wind and fire.',
          coaching_text: 'Avoid driving in inclement weather.',
          unit: '%',
          unit_label: 'of total driving distance',
          value: Math.round(2 * (1.25 - Math.random() * 0.5) * 10) / 10,
          relative_value: Math.round(1.3 * (1.15 - Math.random() * 0.3) * 10) / 10,
          relative_value_label: 'Avg. for other drivers'
        }
      ]
    }
  }
}

function getDrivingScore(vehicleId, cb) {
  showLoading();
  clearData();

  if (queryParams.demo) {
    data = createDemoDrivingScore(vehicleId);
    hideLoading();
    cb();
  }

  // TODO: fetch real driving score
  data = createDemoDrivingScore(vehicleId);
  hideLoading();
  cb();
}

function renderScoreComponent(component) {
  return $('<div>').addClass('score-group-wrapper')
    .append($('<h3>').text(component.title))
    .append($('<div>').addClass('score-group')
      .append($('<div>').addClass('score-group-value').text(`${component.value}${component.unit}`))
      .append($('<div>').addClass('score-group-label').text('You'))
    )
    .append($('<div>').addClass('score-group')
      .append($('<div>').addClass('score-group-value').text(`${component.relative_value}${component.unit}`))
      .append($('<div>').addClass('score-group-label').text(component.relative_value_label))
    )
    .append($('<div>').addClass('score-group-unit-label').text(component.unit_label))
    .append($('<div>').addClass('score-group-description').text(component.description));
}

function renderDrivingScore() {
  renderDrivingScoreGraph();

  $('<h2>').text('Great job!').appendTo('#scoreResults');
  $('<div>').text(`Your score of ${data.score} puts you ahead of:`).appendTo('#scoreResults');
  $('<div>').addClass('score-item-wrapper').append(data.relative_score_group.map(scoreGroup => {
    return $('<div>').addClass('score-item')
      .append($('<div>').addClass('score-item-value').text(`${scoreGroup.percentile_rank}%`))
      .append($('<div>').addClass('score-item-text').text(` of all ${scoreGroup.group_title}`));
  })).appendTo('#scoreResults');

  $('<h2>').addClass('score-groups-label').text('Score Components - Positive Contributions').appendTo('#scoreComponents');
  $('<div>').addClass('score-groups').append(data.score_factors.positive.map(renderScoreComponent)).appendTo('#scoreComponents');
  $('<h2>').addClass('score-groups-label').text('Score Components - Negative Contributions').appendTo('#scoreComponents');
  $('<div>').addClass('score-groups').append(data.score_factors.negative.map(renderScoreComponent)).appendTo('#scoreComponents');

  $('<h2>').text('What makes a Safe Driver Score?').appendTo('#scoreComponents');
  $('<p>').text('Your driver score combines your behavior, paradigm shift business-to-consumer learning curve churn rate analytics pitch bootstrapping. Incubator agile development technology user experience gamification lean startup interaction design learning curve. Twitter learning curve founders stock niche market. Release value proposition research & development startup niche market channels business model canvas interaction design non-disclosure agreement infrastructure angel investor funding.').appendTo('#scoreComponents');
}

function renderDrivingScoreGraph() {
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
