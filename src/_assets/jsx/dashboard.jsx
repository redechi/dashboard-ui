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
      filters: filters.getFiltersFromQuery(this.props.location.query),
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      filterHeight: 94,
      vehicles: [],
      ranges: stats.calculateRanges()
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
      let trips;
      if(exportType === 'selected') {
        trips = _.filter(this.state.trips, trip => trip.selected);
      } else if (exportType === 'tripList') {
        trips = this.state.trips;
      } else if (exportType === 'all') {
        trips = this.state.allTrips;
      }

      if (!trips || !trips.length) {
        return alert('Please Select at least one trip');
      }

      exportData.trips(trips, cb);
    }

    this.handleResize = () => {
      this.setState({
        windowHeight: window.innerHeight,
        filterHeight: document.getElementById('filters').offsetHeight
      });
    };

    this.updateFilter = (filterName, filterValue) => {
      if(filterValue) {
        this.state.filters[filterName] = filterValue;
      } else {
        delete this.state.filters[filterName];
      }

      this.setFilters(this.state.filters);
    };

    this.resetFilters = () => {
      this.setFilters(filters.getFiltersFromQuery());
    };

    this.undoFilter = () => {
      this.props.history.goBack();

      // wait for goBack() to fire before updating filters
      setTimeout(() => {
        this.setFilters(filters.getFiltersFromQuery(this.props.location.query));
      }, 50);
    }
  }

  setFilters(newFilters) {
    this.setState({
      filters: newFilters,
      trips: filters.filterTrips(this.state.allTrips, newFilters)
    });
    this.props.history.pushState(null, this.props.location.pathname, newFilters);

    setTimeout(() => {
      this.handleResize();
    }, 100);
  }

  areAllSelected() {
    return _.every(this.state.trips, (trip) => trip.selected);
  }

  render() {
    let totals = stats.calculateTotals(this.state.trips);

    return (
      <div className="main">
        <Header />
        <div>
          <Filters
            filters={this.state.filters}
            vehicles={this.state.vehicles}
            updateFilter={this.updateFilter}
            resetFilters={this.resetFilters}
            undoFilter={this.undoFilter}
            ranges={this.state.ranges} />
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
                windowHeight={this.state.windowHeight}
                filterHeight={this.state.filterHeight} />
            </div>
            <div className="left-column">
              <Graph
                trips={this.state.trips}
                totals={totals}
                filters={this.state.filters}
                windowWidth={this.state.windowWidth} />
              <Map
                trips={this.state.trips}
                totals={totals}
                windowHeight={this.state.windowHeight}
                filterHeight={this.state.filterHeight}
                toggleSelect={this.toggleSelect} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.handleResize, 100));

    requests.getData((e, trips, vehicles) => {
      if(e) {
        return alert('Unable to fetch data. Please try again later.');
      }
      let allTrips = trips.map(trip => formatters.formatTrip(trip, vehicles));

      this.setState({
        allTrips: allTrips,
        trips: filters.filterTrips(allTrips, this.state.filters),
        vehicles: vehicles,
        ranges: stats.calculateRanges(allTrips)
      });

    });
  }
};
