import React from 'react';
import moment from 'moment';
import { Modal } from 'react-bootstrap';

const alert = require('../js/alert');
const filters = require('../js/filters');
const formatters = require('../js/formatters');
const login = require('../js/login');
const requests = require('../js/requests');
const stats = require('../js/stats');

const Filters = require('./filters.jsx');
const Graph = require('./graph.jsx');
const Map = require('./map.jsx');
const TripList = require('./trip_list.jsx');
const TripStats = require('./trip_stats.jsx');

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      allTrips: [],
      filters: filters.getFiltersFromQuery(this.props.location ? this.props.location.query : {}),
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      filterHeight: 94,
      vehicles: [],
      ranges: stats.calculateRanges(),
      tripRequestMinDate: moment().valueOf(),
      showLoadingModal: true,
      loadingProgressText: ''
    };

    this.handleResize = () => {
      this.setState({
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        filterHeight: document.getElementById('filters').offsetHeight
      });
    };

    this.updateFilter = (filterName, filterValue) => {
      if (filterValue) {
        this.state.filters[filterName] = filterValue;
      } else {
        delete this.state.filters[filterName];
      }

      if (filterName === 'date') {
        const dateFilterComponents = this.state.filters.date.split(',');
        const startDate = parseInt(dateFilterComponents[0], 10);
        this.getTrips(startDate, () => {
          this.setState({
            trips: filters.filterTrips(this.state.allTrips, this.state.filters),
            ranges: stats.calculateRanges(this.state.allTrips)
          });
        });
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
    };

    this.updateLoadingProgress = (progress, total) => {
      this.setState({
        loadingProgressText: `${progress} of ${total} trips`
      });
    };

    this.closeNoTripsModal = () => {
      this.setState({
        showNoTripsModal: false
      });
    };

    this.getTrips = (startDate, cb) => {
      // if demo mode and trips are already loaded, send them
      if (!login.isLoggedIn() && this.state.allTrips.length) {
        return cb();
      }

      const tripRequestMinDate = this.state.tripRequestMinDate;

      if (startDate < tripRequestMinDate) {
        this.setState({
          showLoadingModal: true
        });
        requests.getTrips(startDate, tripRequestMinDate, this.updateLoadingProgress, (e, trips, vehicles) => {
          if (e) {
            return alert('Unable to fetch data. Please try again later.');
          }

          const allTrips = this.state.allTrips.concat(trips.map(trip => formatters.formatTrip(trip, vehicles)));

          this.setState({
            allTrips,
            vehicles,
            tripRequestMinDate: startDate,
            showLoadingModal: false,
            loadingProgressText: ''
          }, cb);
        });
      } else {
        cb();
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    const dateFilterComponents = this.state.filters.date.split(',');
    const startDate = parseInt(dateFilterComponents[0], 10);
    this.getTrips(startDate, () => {
      if (!this.state.allTrips.length) {
        requests.userHasNoTrips((e, userHasNoTrips) => {
          if (userHasNoTrips) {
            this.setState({
              showNoTripsModal: true
            });
          }
        });
      }

      this.setState({
        trips: filters.filterTrips(this.state.allTrips, this.state.filters),
        ranges: stats.calculateRanges(this.state.allTrips)
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
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

  render() {
    const totals = stats.calculateTotals(this.state.trips);

    return (
      <div className="main">
        <div>
          <Filters
            filters={this.state.filters}
            vehicles={this.state.vehicles}
            updateFilter={this.updateFilter}
            resetFilters={this.resetFilters}
            undoFilter={this.undoFilter}
            ranges={this.state.ranges}
          />
          <div>
            <div className="right-column">
              <TripStats
                trips={this.state.trips}
                totals={totals}
              />
              <TripList
                allTrips={this.state.allTrips}
                trips={this.state.trips}
                windowHeight={this.state.windowHeight}
                filterHeight={this.state.filterHeight}
                getTrips={this.getTrips}
              />
            </div>
            <div className="left-column">
              <Graph
                trips={this.state.trips}
                totals={totals}
                filters={this.state.filters}
                windowWidth={this.state.windowWidth}
              />
              <Map
                trips={this.state.trips}
                totals={totals}
                windowHeight={this.state.windowHeight}
                filterHeight={this.state.filterHeight}
              />
            </div>
          </div>
        </div>
        <Modal show={this.state.showLoadingModal} className="loading-modal">
          <Modal.Body>
            <div>Loading trips&hellip;</div>
            <div className="loading-progress">{this.state.loadingProgressText}</div>
          </Modal.Body>
        </Modal>
        <Modal show={this.state.showNoTripsModal} className="notrips-modal">
          <Modal.Body>
            <h2>You haven't taken any trips yet.</h2>
            <div className="notrips-text">
              Once you start driving with Automatic, your trips and drive data will be available here to explore.
              Use our <a href="https://www.automatic.com/app">mobile app</a> to get started.
            </div>
            <div className="btn btn-blue btn-close" onClick={this.closeNoTripsModal}>OK</div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
Dashboard.propTypes = {
  location: React.PropTypes.object.isRequired,
  history: React.PropTypes.object
};

module.exports = Dashboard;
