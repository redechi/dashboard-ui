import React from 'react';
var formatters = require('../js/formatters');

module.exports = class TripStats extends React.Component {
  constructor(props) {
    super(props);
  }

  calculateStats() {
    if(!this.props.trips) {
      return false;
    }

    let stats = this.props.trips.reduce((memo, trip) => {
      memo.distance += trip.distance_miles;
      memo.duration += trip.duration_s;
      memo.fuel += trip.fuel_volume_gal;
      memo.cost += trip.fuel_cost_usd;
      memo.sumScoreEvents += trip.scoreEvents * trip.duration_s;
      memo.sumscoreSpeeding += trip.scoreSpeeding * trip.duration_s;
      return memo;
    }, {distance: 0, duration: 0, fuel: 0, cost: 0, sumScoreEvents: 0, sumScoreSpeeding: 0});

    let scoreEvents = (stats.sumScoreEvents / stats.duration) || 0;
    let scoreSpeeding = (stats.sumScoreSpeeding / stats.duration) || 0;
    stats.score = Math.max(0, scoreEvents) + Math.max(0, scoreSpeeding);

    stats.mpg = (stats.distance / stats.fuel) || 0;

    return {
      distance: formatters.distance(stats.distance),
      duration: formatters.durationHours(stats.duration),
      score: formatters.score(stats.score),
      cost: formatters.costWithUnit(stats.cost),
      mpg: formatters.averageMPG(stats.mpg)
    };
  }

  render() {
    if(!this.props.trips) {
      return (<div />);
    } else if(!this.props.trips.length) {
      return (
        <div className="trip-stats no-trips">
          <div className="alert-grey">No trips match these criteria</div>
        </div>
      );
    } else {
      var stats = this.calculateStats();

      return (
        <div className="trip-stats">
          <div className="stat distance">
            <div className="value">{stats.distance}</div>
            <div className="label">Miles</div>
          </div>
          <div className="stat mpg active">
            <div className="value">{stats.mpg}</div>
            <div className="label">MPG</div>
          </div>
          <div className="stat cost">
            <div className="value">{stats.cost}</div>
            <div className="label">Fuel</div>
          </div>
          <div className="stat duration">
            <div className="value">{stats.duration}</div>
            <div className="label">Hours</div>
          </div>
        </div>
      );
    }
  }
};
