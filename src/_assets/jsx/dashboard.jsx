import React from 'react';
import _ from 'underscore';

const exportData = require('../js/export_data');
const filters = require('../js/filters');
const formatters = require('../js/formatters');
const requests = require('../js/requests');
const stats = require('../js/stats');

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
      exporting: false,
      windowHeight: window.innerHeight
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

    this.handleResize = () => {
      this.setState({windowHeight: window.innerHeight});
    };
  }

  areAllSelected() {
    return _.every(this.state.trips, (trip) => trip.selected);
  }

  render() {
    let totals = stats.calculateTotals(this.state.trips);

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
                exporting={this.state.exporting}
                windowHeight={this.state.windowHeight} />
            </div>
            <div className="left-column">
              <Graph
                trips={this.state.trips}
                totals={totals} />
              <Map
                trips={this.state.trips}
                totals={totals}
                windowHeight={this.state.windowHeight} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.handleResize, 100));

    requests.getTrips((e, trips) => {
      if(e) {
        return alert('Unable to fetch trips. Please try again later.');
      }

      this.setState({trips: trips.map(formatters.formatTrip)});
    });
  }
};
