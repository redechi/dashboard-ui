import React from 'react';

const formatters = require('../js/formatters');

module.exports = class TripStats extends React.Component {
  constructor(props) {
    super(props);
  }

  scorePieChart() {
    let score = this.props.totals.score;
    let scoreColor = formatters.scoreColor(this.props.totals.score);
    let data = [{ value: score }];

    let w = 40;
    let h = 40;
    let r = 18;
    let innerRadius = 17;
    let transitionsDuration = 1000;
    let transitionsDelay = 250;

    //remove old chart
    d3.select('#score-chart svg').remove();

    let svg = d3.select('#score-chart').append('svg');

    let rScale = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]);

    let arc = d3.svg.arc()
      .outerRadius(r + 0.8)
      .innerRadius(innerRadius);

    let pie = d3.layout.pie()
      .value(d => d.value);

    function arcTween(transition, newAngle) {
      transition.attrTween('d', (d) => {
        let interpolate = d3.interpolate(0, 360 * (d.value / 100) * Math.PI / 180);

        return (t) => {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });
    }

    let chart = svg
      .data([data])
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${r + 1},${r + 1})`);

    chart.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', r + 1)
      .attr('class', 'pie-big-circle');

    chart.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', innerRadius)
      .attr('class', 'pie-small-circle');

    chart.append('text')
      .attr('class', 'pie-text')
      .attr('text-anchor', 'middle')
      .attr('y', 6)
      .text(score)
      .attr('fill', scoreColor)
      .transition()
      .duration(transitionsDuration)
      .delay(transitionsDelay)
      .ease('elastic');

    let arcs = chart.selectAll('g')
      .data(pie)
      .enter()
      .append('g');

    arcs
      .append('path')
      .attr('fill', scoreColor)
      .each((d) => {
        d.endAngle = 0;
      })
      .attr('d', arc)
      .transition()
      .duration(transitionsDuration)
      .delay(transitionsDelay)
      .ease('elastic')
      .call(arcTween, this);
  }

  render() {
    if (!this.props.trips) {
      return (<div />);
    } else if (!this.props.trips.length) {
      return (
        <div className="trip-stats no-trips">
          <div className="alert-grey">No trips match these criteria</div>
        </div>
      );
    } else {
      let scoreColor = formatters.scoreColor(this.props.totals.score);

      return (
        <div className="trip-stats" style={{
            borderBottomColor: scoreColor,
            boxShadow: `inset 0px -2px 3px 0px rgba(${scoreColor.replace(/[^\d,]/g, '')}, 0.3)`
          }}>
          <div className="score-chart" id="score-chart"></div>
          <div className="stat distance">
            <div className="value">{this.props.totals.distance}</div>
            <div className="label">Miles</div>
          </div>
          <div className="stat mpg active">
            <div className="value">{this.props.totals.mpg}</div>
            <div className="label">MPG</div>
          </div>
          <div className="stat cost">
            <div className="value">{this.props.totals.cost}</div>
            <div className="label">Fuel</div>
          </div>
          <div className="stat duration">
            <div className="value">{this.props.totals.duration}</div>
            <div className="label">Hours</div>
          </div>
        </div>
      );
    }
  }

  componentDidMount() {
    this.scorePieChart();
  }

  componentDidUpdate(prevProps) {
    if (this.props.totals.score !== prevProps.totals.score) {
      this.scorePieChart();
    }
  }
};
