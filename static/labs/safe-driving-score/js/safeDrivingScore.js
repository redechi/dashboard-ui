function createDemoDrivingScore() {
  const random = Math.random();

  return {
    score: Math.ceil(random * 500) + 200,
    score_max: 800,
    score_min: 200,
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

function createDemoDrivingScoreHistory() {
  const time = moment().subtract(13, 'month');

  return {
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
  $('#prescoreResults').hide();
}

function showError() {
  $('#error').show();
  $('#noData').hide();
  $('#results').hide();
  $('#prescoreResults').hide();
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

  $.ajax({
    url: apiUrl,
    data: {
      vehicle_id: vehicleId
    },
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(cb)
  .fail(function(jqXHR, textStatus, errorThrown) {
    if (jqXHR.status === 404) {
      // If no driving score, check for pre score insights
      getPreScoreInsights(vehicleId, renderPreScoreInsights);
    } else {
      hideLoading();
      showError();
    }
  });
}

function getDrivingScoreHistory(vehicleId, cb) {
  if (queryParams.demo) {
    return cb(createDemoDrivingScoreHistory(vehicleId));
  }

  var accessToken = getAccessToken();
  // TODO: make it point to moxie prod once safe driving score hits production
  var isStaging = window.location.search.indexOf('staging') !== -1;
  var apiUrl = isStaging ? 'https://moxie-stage.automatic.co/safe-driving-score-history/' : 'https://moxie-stage.automatic.co/safe-driving-score-history/';

  $.ajax({
    url: apiUrl,
    data: {
      vehicle_id: vehicleId
    },
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(cb)
  .fail(function(jqXHR, textStatus, errorThrown) {
    if (jqXHR.status === 404) {
      // Ignore history if not found
    } else {
      showError();
    }
  });
}

function getPreScoreInsights(vehicleId, cb) {
  var accessToken = getAccessToken();
  // TODO: make it point to moxie prod once safe driving score hits production
  var isStaging = window.location.search.indexOf('staging') !== -1;
  var apiUrl = isStaging ? 'https://moxie-stage.automatic.co/safe-driving-score-pre-insights/' : 'https://moxie-stage.automatic.co/safe-driving-score-pre-insights/';

  $.ajax({
    url: apiUrl,
    data: {
      vehicle_id: vehicleId
    },
    headers: {
      Authorization: 'bearer ' + accessToken
    }
  })
  .done(cb)
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
  var components = []
  components.push($('<div>').addClass('col-md-12 pt-4 text-center')
    .append($('<h3>').text(component.title))
    .append($('<div>').addClass('score-group-description').text(component.description)));

  components.push($('<div>').addClass('col-6 text-center')
    .append($('<div>').addClass('score-group-value you')
      .append($('<span>').text(component.value))
      .append($('<span>').addClass('score-group-value-unit').text(component.unit)))
    .append($('<div>').addClass('score-group-label').text('You')));

  components.push($('<div>').addClass('col-6 text-center')
    .append($('<div>').addClass('score-group-value')
      .append($('<span>').text(component.relative_value))
      .append($('<span>').addClass('score-group-value-unit').text(component.unit)))
    .append($('<div>').addClass('score-group-label').text(component.relative_value_label)));

  components.push($('<div>').addClass('col-md-12 text-center score-group-unit-label').text(component.unit_descriptor));

  components.push($('<div>').addClass('col-md-12')
    .append($('<div>').addClass('score-group-suggestion border-bottom pt-4').text(component.coaching_text)));

  return components;
}

function renderDrivingScore(score) {
  data.score = score;

  hideLoading();
  $('#results').fadeIn();
  $('#prescoreResults').hide();
  $('#noData').hide();
  $('#error').hide();

  $('#scoreContainer')
    .append($('<div>').addClass('score-value').text(score.score))
    .append($('<div>').addClass('score-month').text(`${moment(score.month, 'MM').format('MMMM')} ${score.year}`));

  $('<h2>').text('Great job!').appendTo('#scoreResults');
  $('<div>').addClass('pt-3 score-info').text(`Your score of ${score.score} puts you ahead of:`).appendTo('#scoreResults');
  $('<div>').addClass('score-item-wrapper').append(score.relative_score_group.map(scoreGroup => {
    return $('<div>').addClass('score-item')
      .append($('<div>').addClass('score-item-value').text(`${scoreGroup.percentile_rank}%`))
      .append($('<div>').addClass('score-item-text').text(` of all ${scoreGroup.group_title}`));
  })).appendTo('#scoreResults');

  score.score_factors.positive.map(renderScoreComponent).forEach(function(component) {
    $('#scoreComponentsPositive').append(component);
  });

  score.score_factors.negative.map(renderScoreComponent).forEach(function(component) {
    $('#scoreComponentsNegative').append(component);
  });

  if (sessionStorage.getItem(score.vehicle_id + 'ShareURL')) {
    showShareOptions(sessionStorage.getItem(score.vehicle_id + 'ShareURL'));
  } else {
    hideShareOptions();
    $('#share-button').toggle(!queryParams.demo && !queryParams.share);
  }

  $('#feedback').toggle(!queryParams.demo && !queryParams.share);
  $('.share-intro-text').toggle(!!queryParams.share);

  renderScoreGraph(score);
}

function renderDrivingScoreHistory(history) {
  data.history = history;

  hideLoading();
  if (!history.score_history || history.score_history.length < 2) {
    $('#scoreHistory').hide();
    return;
  }

  $('#scoreHistory').show();
  renderDrivingScoreHistoryGraph(history);
}

function renderDrivingScoreHistoryGraph(history) {
  var wrapper = document.getElementById('scoreHistoryGraph');
  var margin = {top: 10, right: 20, bottom: 50, left: 35};
  var containerWidth = document.getElementById('container').offsetWidth - 30;
  var width = containerWidth - margin.left - margin.right;
  var height = Math.min(300, window.innerHeight) - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%m-%Y");

  var bisectDate = d3.bisector(function(d) { return d.date; }).right;

  var graphData = history.score_history;

  graphData.forEach(function(d) {
    d.date = parseDate(('00' + d.month).slice(-2) + '-' + d.year.toString());
  });

  var xScale = d3.scaleTime()
      .domain(d3.extent(graphData, function(d) { return d.date; }))
      .range([0, width]);

  var yScale = d3.scaleLinear()
      .domain([history.score_min, history.score_max])
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
        .attr("dy", "1.30em")
        .attr("dx", "-1.3em");

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

/* Sharing support */

$('.btn-share').click(function(e) {
  e.preventDefault();

  $('.btn-share').html(generateSpinner());
  saveShareData(data, function(e, shareUrlSlug) {
    if (e) {
      return alert(e);
    }

    var shareURL = window.location.origin + window.location.pathname + '?share=' + shareUrlSlug;
    showShareOptions(shareURL);
  });
});

$('.share-url').focus(function() {
  $(this).select();
});

function showShareOptions(shareURL) {
  $('#share-controls').slideDown();
  $('.share-url')
    .val(shareURL)
    .select();
  $('#share-button').hide();

  var emailShareURL = formatEmailShare('My Automatic Drive Score', 'My Automatic Drive Score is ' + data.score.score + '! That puts me in the top ' + data.score.relative_score_group[0].percentile_rank + '% of all ' + data.score.relative_score_group[0].group_title + '.', shareURL);
  var twitterShareURL = formatTwitterShare('My Automatic Drive Score is ' + data.score.score + '! That puts me in the top ' + data.score.relative_score_group[0].percentile_rank + '% of all ' + data.score.relative_score_group[0].group_title + '.', shareURL);

  $('.btn-email').attr('href', emailShareURL);
  $('.btn-twitter').attr('href', twitterShareURL);

  sessionStorage.setItem(data.score.vehicle_id + 'ShareURL', shareURL);
}

function hideShareOptions() {
  $('.btn-share').html('<i class="fa fa-share"></i> Share this report');
  $('#share-controls').hide();
}

function renderPreScoreInsights(data) {
  hideLoading();
  $('#prescoreResults').fadeIn();
  $('#noData').hide();
  $('#error').hide();

  var insights = _.last(_.sortBy(data.pre_score_insights, 'week_number'));

  insights.factors.forEach(function(factor) {
    var details = data.pre_score_insight_factor_details[factor.factor];

    if (!details) {
      return
    }

    $('<div>').addClass('col-md-12 pt-4 text-center')
      .append($('<h3>').text(details.title))
      .append($('<div>').addClass('score-group-description').text(details.description))
      .appendTo('#preScoreInsights');

    $('<div>').addClass('col-6 text-center')
      .append($('<div>').addClass('score-group-value you')
        .append($('<span>').text(factor.value))
        .append($('<span>').addClass('score-group-value-unit').text(details.unit)))
      .append($('<div>').addClass('score-group-label').text('You'))
      .appendTo('#preScoreInsights');

    $('<div>').addClass('col-6 text-center')
      .append($('<div>').addClass('score-group-value')
        .append($('<span>').text(factor.relative_value))
        .append($('<span>').addClass('score-group-value-unit').text(details.unit)))
      .append($('<div>').addClass('score-group-label').text(details.relative_value_label))
      .appendTo('#preScoreInsights');

    $('<div>').addClass('col-md-12 text-center score-group-unit-label')
      .text(details.unit_descriptor)
      .appendTo('#preScoreInsights');

    $('<div>').addClass('col-md-12')
      .append($('<div>').addClass('score-group-suggestion border-bottom pt-4').text(details.coaching_text))
      .appendTo('#preScoreInsights');
  });

  $('#preScoreProgress')
    .append($('<span>').addClass('font-weight-bold').text(`Week ${insights.week_number}`))
    .append($('<span>').text(` (${insights.week_start_date})`));

  var preScoreMaxWeeks = 16;
  var preScoreProgress = Math.round(insights.week_number / preScoreMaxWeeks * 100);
  $('#preScoreProgressBar .progress-bar')
    .css('width', `${preScoreProgress}%`)
    .attr('aria-valuenow', preScoreProgress);
}

function renderScoreGraph(score) {
  var percent = (score.score - score.score_min) / (score.score_max - score.score_min);
  var chartInset = 10;
  var totalPercent = .75;
  var el = d3.select('#scoreGraph');

  var margin = {
    top: 10,
    right: 30,
    bottom: 25,
    left: 30
  };

  var width = el.node().getBoundingClientRect().width - margin.left - margin.right;
  var height = width / 2;
  var radius = width / 2;
  var barWidth = 40 * width / 300;

  function percToDeg(perc) {
    return perc * 360;
  };

  function percToRad(perc) {
    return degToRad(percToDeg(perc));
  };

  function degToRad(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  var svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

  // Add layer for the panel
  var chart = svg.append('g').attr('transform', "translate(" + ((width) / 2 + margin.left) + ", " + (height + margin.top) + ")");

  chart.append('path').attr('class', "arc gauge-first");
  chart.append('path').attr('class', "arc gauge-second");
  chart.append('path').attr('class', "arc gauge-third");
  chart.append('path').attr('class', "arc gauge-fourth");

  var arc4 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  var arc3 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  var arc2 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  var arc1 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

  var chartProportion = 0.5;
  var arcCount = 4;
  var padRad = 0.025;
  var arcLength = percToRad(chartProportion / arcCount);
  var next_start = totalPercent;

  arc1.startAngle(percToRad(next_start)).endAngle(percToRad(next_start) + arcLength);
  next_start += chartProportion / arcCount;

  arc2.startAngle(percToRad(next_start) + padRad).endAngle(percToRad(next_start) + arcLength);
  next_start += chartProportion / arcCount;

  arc3.startAngle(percToRad(next_start) + padRad).endAngle(percToRad(next_start) + arcLength);
  next_start += chartProportion / arcCount;

  arc4.startAngle(percToRad(next_start) + padRad).endAngle(percToRad(next_start) + arcLength);
  next_start += chartProportion / arcCount;

  chart.select(".gauge-first").attr('d', arc1);
  chart.select(".gauge-second").attr('d', arc2);
  chart.select(".gauge-third").attr('d', arc3);
  chart.select(".gauge-fourth").attr('d', arc4);

  chart.append("text")
    .text(score.score_min)
    .attr("id", "lower")
    .attr('transform', "translate(" + (-(width + margin.left) / 1.87) + ", " + 0 + ")")
    .attr('class', "gauge-label");

  chart.append("text")
    .text(score.score_max)
    .attr("id", "upper")
    .attr('transform', "translate(" + ((width + margin.left) / 2.27) + ", " + 0 + ")")
    .attr('class', "gauge-label");

  // Helper function that returns the `d` value for moving the needle
  function recalcPointerPos(perc) {
    var thetaRad = percToRad(perc / 2);
    var centerX = 0;
    var centerY = 0;
    var topX = centerX - this.len * Math.cos(thetaRad);
    var topY = centerY - this.len * Math.sin(thetaRad);
    var leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
    var leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
    var rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
    var rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
    return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
  };

  function Needle(el) {
    this.el = el;
    this.len = width / 2.5;
    this.radius = this.len / 8;
  }

  Needle.prototype.render = function() {
    this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
    return this.el.append('path').attr('class', 'needle').attr('id', 'client-needle').attr('d', recalcPointerPos.call(this, 0));
  };

  Needle.prototype.moveTo = function(perc) {
    var self;
    var oldValue = this.perc || 0;

    this.perc = perc;
    self = this;

    // Reset pointer position
    this.el.transition().delay(100).ease(d3.easeQuad).duration(200).select('.needle').tween('reset-progress', function() {
      var needle = d3.select(this)
      return function(percentOfPercent) {
        var progress = (1 - percentOfPercent) * oldValue;
        return needle.attr('d', recalcPointerPos.call(self, progress));
      };
    });

    this.el.transition().delay(300).ease(d3.easeBounce).duration(1500).select('.needle').tween('progress', function() {
      var needle = d3.select(this)
      return function(percentOfPercent) {
        var progress = percentOfPercent * perc;
        return needle.attr('d', recalcPointerPos.call(self, progress));
      };
    });
  };

  needle = new Needle(chart);
  needle.render();
  needle.moveTo(percent);
}
