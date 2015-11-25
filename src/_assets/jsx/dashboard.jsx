import React from 'react';
var _ = require('underscore');
var exportData = require('../js/export_data');
var formatters = require('../js/formatters');
var requests = require('../js/requests');

const Filters = require('./filters.jsx');
const Graph = require('./graph.jsx');
const Header = require('./header.jsx');
const Map = require('./map.jsx');
const TripList = require('./trip_list.jsx');
const TripStats = require('./trip_stats.jsx');


module.exports = class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      allSelected: false,
      exporting: false
    };

    this.toggleSelect = (tripId) => {
      let trip = _.findWhere(this.state.trips, {id: tripId});
      trip.selected = !trip.selected;
      this.setState({
        allSelected: this.areAllSelected(),
        trips: this.state.trips
      });
    };

    this.toggleSelectAll = () => {
      if(this.areAllSelected()) {
        this.setState({
          allSelected: false,
          trips: this.state.trips.map((trip) => {
            trip.selected = false;
            return trip;
          })
        });
      } else {
        this.setState({
          allSelected: true,
          trips: this.state.trips.map((trip) => {
            trip.selected = true;
            return trip;
          }
        )});
      }
    }

    this.export = (exportType, cb) => {
      if(this.state.exporting) {
        return;
      }

      this.setState({exporting: true});

      let trips;
      if(exportType === 'selected') {
        trips = _.filter(this.state.trips, (trip) => trip.selected);
      } else if (exportType === 'tripList') {
        // TODO: apply filtered trips
        trips = this.state.trips;
      } else if (exportType === 'all') {
        trips = this.state.trips;
      }

      if (!trips || !trips.length) {
        return alert('Please Select at least one trip');
      }

      exportData.trips(trips, (e) => {
        this.setState({exporting: false});
        cb(e);
      });
    }
  }

  calculateTotals() {
    if(!this.state.trips) {
      return false;
    }

    let stats = this.state.trips.reduce((memo, trip) => {
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

  areAllSelected() {
    return _.every(this.state.trips, (trip) => trip.selected);
  }

  render() {
    let totals = this.calculateTotals();

    return (
      <div>
        <Header />
        <div>
          <Filters />
          <div>
            <div className="right-column">
              <TripStats
                trips={this.state.trips}
                totals={totals} />
              <TripList
                trips={this.state.trips}
                allSelected={this.state.allSelected}
                toggleSelect={this.toggleSelect}
                toggleSelectAll={this.toggleSelectAll}
                export={this.export}
                exporting={this.state.exporting} />
            </div>
            <div className="left-column">
              <Graph
                trips={this.state.trips}
                totals={totals} />
              <Map trips={this.state.trips} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    requests.getTrips((e, trips) => {
      if(e) {
        return alert('Unable to fetch trips. Please try again later.');
      }

      this.setState({trips: trips.map(formatters.formatTrip)});
    });
  }
};
