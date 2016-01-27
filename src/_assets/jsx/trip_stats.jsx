import React from 'react';
import d3 from 'd3';

const formatters = require('../js/formatters');

class TripStats extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.scorePieChart();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.totals || (this.props.totals && this.props.totals.score !== prevProps.totals.score)) {
      this.scorePieChart();
    }
  }

  scorePieChart() {
    const totals = this.props.totals || {};
    const score = totals.score;
    const scoreColor = formatters.scoreColor(totals.score);
    const data = [{ value: score }];

    const w = 40;
    const h = 40;
    const r = 18;
    const innerRadius = 17;
    const transitionsDuration = 1000;
    const transitionsDelay = 250;

    // remove old chart
    d3.select('#score-chart svg').remove();

    const svg = d3.select('#score-chart').append('svg');

    const arc = d3.svg.arc()
      .outerRadius(r + 0.8)
      .innerRadius(innerRadius);

    const pie = d3.layout.pie()
      .value(d => d.value);

    function arcTween(transition) {
      transition.attrTween('d', (d) => {
        const interpolate = d3.interpolate(0, 360 * (d.value / 100) * Math.PI / 180);

        return (t) => {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });
    }

    const chart = svg
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

    const arcs = chart.selectAll('g')
      .data(pie)
      .enter()
      .append('g')
      .attr('transform', 'rotate(180)');

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
    if (!this.props.totals || this.props.totals.count === 0) {
      return (
        <div className="trip-stats no-trips">
          <div className="alert-grey">No trips match these criteria</div>
        </div>
      );
    }

    const totals = this.props.totals || {};
    const scoreColor = formatters.scoreColor(totals.score);

    return (
      <div className="trip-stats" style={{
        borderBottomColor: scoreColor,
        boxShadow: `inset 0px -2px 3px 0px rgba(${scoreColor.replace(/[^\d,]/g, '')}, 0.3)`
      }}
      >
        <div className="score-chart" id="score-chart"></div>
        <div className="stat distance">
          <div className="value">{totals.distance}</div>
          <div className="label">Miles</div>
        </div>
        <div className="stat mpg active">
          <div className="value">{totals.mpg}</div>
          <div className="label">MPG</div>
        </div>
        <div className="stat cost">
          <div className="value">{totals.cost}</div>
          <div className="label">Fuel</div>
        </div>
        <div className="stat duration">
          <div className="value">{totals.duration}</div>
          <div className="label">Hours</div>
        </div>
      </div>
    );
  }
}
TripStats.propTypes = {
  totals: React.PropTypes.object
};

module.exports = TripStats;
