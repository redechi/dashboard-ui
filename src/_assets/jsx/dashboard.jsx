import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';

const alert = require('../js/alert');
const cache = require('../js/cache');
const filters = require('../js/filters');
const formatters = require('../js/formatters');
const login = require('../js/login');
const mobile = require('../js/mobile');
const requests = require('../js/requests');
const stats = require('../js/stats');

const Filters = require('./filters.jsx');
const Graph = require('./graph.jsx');
const Map = require('./map.jsx');
const TripList = require('./trip_list.jsx');

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

    this.handleResize = _.debounce(() => {
      this.setState({
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        filterHeight: document.getElementById('filters').offsetHeight
      });
    }, 100);

    this.updateFilter = (filterName, filterValue, cb) => {
      if (filterValue) {
        this.state.filters[filterName] = filterValue;
      } else {
        delete this.state.filters[filterName];
      }

      if (filterName === 'date') {
        const dateFilterComponents = this.state.filters.date.split(',');
        const startDate = parseInt(dateFilterComponents[0], 10);
        const endDate = parseInt(dateFilterComponents[1], 10);
        this.getTrips(startDate, endDate, () => {
          const filteredTripsByDate = filters.filterByDate(this.state.allTrips, this.state.filters.date);
          this.setState({
            trips: filters.filterTrips(filteredTripsByDate, this.state.filters, this.state.vehicles),
            ranges: stats.calculateRanges(filteredTripsByDate)
          });

          // set start date to users oldest trip if `allTime` is selected
          if (dateFilterComponents[2] === 'allTime') {
            dateFilterComponents[0] = moment(_.last(filteredTripsByDate).started_at).valueOf();
            this.state.filters.date = dateFilterComponents.join(',');
            this.setState({
              filters: this.state.filters
            });
          }

          this.setFilters(this.state.filters, cb);
        });
      } else {
        this.setFilters(this.state.filters, cb);
      }
    };

    this.resetFilters = () => {
      this.setFilters(filters.getFiltersFromQuery());
    };

    this.undoFilter = () => {
      this.props.router.goBack();

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

    this.closeTabletWarningModal = () => {
      this.setState({
        showTabletWarningModal: false
      });

      cache.setItem('tabletWarningShown', 'true');
    };

    this.getTrips = (startDate, endDate, cb) => {
      // if demo mode and trips are already loaded, send them
      if (!login.isLoggedIn() && this.state.allTrips.length) {
        return cb();
      }
      let endRequestDate = endDate;

      const tripRequestMinDate = this.state.tripRequestMinDate;
      if (tripRequestMinDate < endDate) {
        endRequestDate = tripRequestMinDate;
      }

      if (startDate < tripRequestMinDate) {
        this.setState({
          showLoadingModal: true
        });
        requests.getTrips(startDate, endRequestDate, this.updateLoadingProgress, (e, trips, vehicles) => {
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

  updateTripTag(tripId, tagged) {
    const allTrips = this.state.allTrips.slice();
    const tripToTag = _.find(allTrips, trip => trip.id === tripId);
    const trips = filters.filterTrips(allTrips, this.state.filters, this.state.vehicles);

    tripToTag.tags = tagged ? ['business'] : [];
    this.setState({ allTrips, trips });
  }

  componentWillMount() {
    // show tablet warning modal if it hasn't already been closed
    if (mobile.isTablet() && !cache.getItem('tabletWarningShown') && this.state.showTabletWarningModal !== false) {
      this.setState({
        showTabletWarningModal: true
      });
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    const dateFilterComponents = this.state.filters.date.split(',');
    const startDate = parseInt(dateFilterComponents[0], 10);
    const endDate = parseInt(dateFilterComponents[1], 10);
    this.getTrips(startDate, endDate, () => {
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
        trips: filters.filterTrips(this.state.allTrips, this.state.filters, this.state.vehicles),
        ranges: stats.calculateRanges(this.state.allTrips)
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  setFilters(newFilters, cb) {
    const newTrips = filters.filterTrips(this.state.allTrips, newFilters, this.state.vehicles);
    const noMatchingTrips = !newTrips.length;
    this.setState({
      filters: newFilters,
      noMatchingTrips,
      trips: newTrips
    });

    this.props.router.push({
      state: null,
      pathname: this.props.location.pathname,
      query: newFilters
    });

    if (cb) {
      cb(noMatchingTrips);
    }

    setTimeout(() => {
      this.handleResize();
    }, 100);
  }

  renderTooManyTripsMessage() {
    const outerStyle = {
      color: '#2c3032',
      display: 'flex',
      flexDirection: 'column',
      margin: '10px',
      fontSize: '16px',
      backgroundColor: 'white',
      padding: '20px 20px 25px 20px'
    };
    const topStyle = {
      textAlign: 'center',
      margin: '10px',
      fontSize: '18px',
      fontWeight: 'bold'
    };
    const bottomStyle = {
      textAlign: 'center'
    };
    return (
      <div className="left-column" style={outerStyle}>
        <div style={topStyle}>
          The Dashboard can not display maps and graphs for this many trips.
        </div>
        <div style={bottomStyle}>
          Please reduce the amount of trips to view the map and graph.
        </div>
      </div>
    );
  }

  renderMapAndGraph(totals) {
    if (this.state.trips && this.state.trips.length > 1000) {
      return this.renderTooManyTripsMessage();
    }
    return (
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
    );
  }

  render() {
    const totals = stats.calculateTotals(this.state.trips);

    return (
      <div className="main-container">
        <div>
          <Filters
            filters={this.state.filters}
            vehicles={this.state.vehicles}
            updateFilter={this.updateFilter}
            noMatchingTrips={this.state.noMatchingTrips}
            resetFilters={this.resetFilters}
            undoFilter={this.undoFilter}
            ranges={this.state.ranges}
          />
          <div>
            <div className="right-column">
              <TripList
                allTrips={this.state.allTrips}
                trips={this.state.trips}
                totals={totals}
                windowHeight={this.state.windowHeight}
                updateTripTag={(tripId, tagged) => { this.updateTripTag(tripId, tagged); }}
                filterHeight={this.state.filterHeight}
                getTrips={this.getTrips}
              />
            </div>
            {this.renderMapAndGraph(totals)}
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
        <Modal show={this.state.showTabletWarningModal} className="tabletwarning-modal">
          <Modal.Body>
            <div className="btn btn-blue btn-close" onClick={this.closeTabletWarningModal}>OK</div>
            <div className="tabletwarning-text">
              Our dashboard isn't tuned for tablets just yet.
              You may notice some performance issues that don't affect desktop browsers.
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
Dashboard.propTypes = {
  location: React.PropTypes.object.isRequired,
  router: React.PropTypes.object
};

module.exports = Dashboard;
