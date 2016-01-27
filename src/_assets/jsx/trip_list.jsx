import React from 'react';
import { Modal, Popover, OverlayTrigger } from 'react-bootstrap';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';

const alert = require('../js/alert');
const exportData = require('../js/export_data');
const formatters = require('../js/formatters');
const highlight = require('../js/highlight');
const select = require('../js/select');

const ListItem = require('./list_item.jsx');
const ModalMap = require('./trip_modal_map.jsx');
const Trip = require('./trip.jsx');

const sortTypes = [
  {
    value: 'started_at',
    name: 'Time/Date'
  },
  {
    value: 'distance_miles',
    name: 'Distance'
  },
  {
    value: 'average_mpg',
    name: 'MPG'
  },
  {
    value: 'fuel_cost_usd',
    name: 'Cost'
  },
  {
    value: 'duration_s',
    name: 'Duration'
  }
];

class TripList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortType: 'started_at',
      sortDirection: 'down',
      showModal: false,
      exporting: false,
      showExportModal: false
    };

    this.reverseSortDirection = () => {
      this.setState({
        sortDirection: this.state.sortDirection === 'down' ? 'up' : 'down'
      });
    };

    this.setSortType = (sortType) => {
      this.refs.sortTypePopover.hide();
      this.setState({ sortType });
    };

    this.export = (type) => {
      this.setState({
        exporting: true
      });

      if (type === 'selected') {
        const selectedTripIds = select.getSelected();
        this.downloadTrips(_.filter(this.props.trips, trip => _.contains(selectedTripIds, trip.id)));
      } else if (type === 'tripList') {
        this.downloadTrips(this.props.trips);
      } else if (type === 'all') {
        this.props.getTrips(1363071600000, () => {
          this.downloadTrips(this.props.allTrips);
        });
      }
    };

    this.showModal = (tripToShow) => {
      const currentIndex = _.findIndex(this.props.trips, trip => trip.id === tripToShow.id);
      this.setState({
        showModal: true,
        modalTrip: tripToShow,
        modalTripIndex: this.props.trips.length - currentIndex
      });
    };

    this.hideModal = () => {
      this.setState({
        showModal: false
      });
    };

    this.hideExportModal = () => {
      this.setState({
        showExportModal: false
      });
    };

    this.showPreviousTrip = () => {
      const currentIndex = _.findIndex(this.props.trips, trip => trip.id === this.state.modalTrip.id);
      if (currentIndex < this.props.trips.length - 1) {
        this.setState({
          modalTrip: this.props.trips[currentIndex + 1],
          modalTripIndex: this.props.trips.length - (currentIndex + 1)
        });
      }
    };

    this.showNextTrip = () => {
      const currentIndex = _.findIndex(this.props.trips, trip => trip.id === this.state.modalTrip.id);
      if (currentIndex > 0) {
        this.setState({
          modalTrip: this.props.trips[currentIndex - 1],
          modalTripIndex: this.props.trips.length - (currentIndex - 1)
        });
      }
    };

    this.toggleSelectAll = () => {
      if (select.areAllSelected()) {
        select.deselectTrips(this.props.trips);
      } else {
        select.selectTrips(this.props.trips);
      }
    };

    this.unhighlightTrips = () => {
      highlight.unhighlightTrips(true);
    };
  }

  getTripListHeight() {
    const verticalPadding = 233;
    return this.props.windowHeight - this.props.filterHeight - verticalPadding;
  }

  downloadTrips(trips) {
    if (!trips || !trips.length) {
      return alert('Please Select at least one trip');
    }

    exportData.trips(trips, (e, blobUrl) => {
      this.setState({
        exporting: false
      });
      if (e && e === 'not_supported') {
        alert('Export is not supported in your browser. Please try again with IE10+, Chrome, Firefox or Safari.');
      }

      if (blobUrl) {
        this.setState({
          showExportModal: true,
          blobUrl
        });
      }

      this.refs.exportPopover.hide();
    });
  }

  sortTrips() {
    return _.sortBy(this.props.trips, (trip) => {
      const direction = this.state.sortDirection === 'down' ? -1 : 1;
      if (this.state.sortType === 'started_at') {
        return moment(trip.started_at).valueOf() * direction;
      } else if (this.state.sortType === 'distance_miles') {
        return trip.distance_miles * direction;
      } else if (this.state.sortType === 'average_mpg') {
        return trip.average_mpg * direction;
      } else if (this.state.sortType === 'fuel_cost_usd') {
        return trip.fuel_cost_usd * direction;
      } else if (this.state.sortType === 'duration_s') {
        return trip.duration_s * direction;
      }
    });
  }

  render() {
    if (!this.props.trips || !this.props.trips.length) {
      return (<div />);
    }

    const selectedSortType = _.find(sortTypes, (item) => item.value === this.state.sortType);

    const trips = this.sortTrips().map((trip, key) => {
      return (
        <Trip trip={trip} showModal={this.showModal} key={key} />
      );
    });

    const sortTypePopover = (
      <Popover id="sortType" title="Sort By" className="popover-sort-type">
        <ul className="list-select animate">
          {sortTypes.map(sortType =>
            <ListItem
              key={sortType.value}
              value={sortType.value}
              name={sortType.name}
              onItemClick={this.setSortType}
            />
          )}
        </ul>
      </Popover>
    );

    const exportPopoverOptions = [
      {
        value: 'selected',
        name: 'Export selected trips'
      },
      {
        value: 'tripList',
        name: `Export trips currently in trip list (${this.props.trips.length})`
      },
      {
        value: 'all',
        name: 'Export all trips'
      }
    ];

    const exportPopover = (
      <Popover id="export" title="Export trips to .csv" className="popover-export">
        <ul className="list-select animate">
          {exportPopoverOptions.map(option =>
            <ListItem
              key={option.value}
              value={option.value}
              name={option.name}
              onItemClick={this.export}
            />
          )}
        </ul>
      </Popover>
    );

    const trip = this.state.modalTrip || this.props.trips[0];
    const tripSpansDay = moment(trip.started_at).dayOfYear() === moment(trip.ended_at).dayOfYear();

    let businessTag;
    if (trip && _.contains(trip.tags, 'business')) {
      businessTag = (
        <div className="tagged-business" title="Tagged as business trip">Tagged as business trip</div>
      );
    }

    return (
      <div>
        <div className="trip-stats"></div>
        <div className="trips-header">
          <div className="trip-count">{this.props.trips.length} Trips</div>
          <div
            className={classNames('sort-direction', { 'sort-up': this.state.sortDirection === 'up' })}
            onClick={this.reverseSortDirection}
          ></div>
          <OverlayTrigger
            placement="bottom"
            trigger="click"
            ref="sortTypePopover"
            overlay={sortTypePopover}
            rootClose={true}
          >
            <div className="sort-type">{selectedSortType.name} <i className="fa fa-angle-down fa-lg"></i></div>
          </OverlayTrigger>
        </div>

        <div className="trips">
          <ul
            style={{ height: this.getTripListHeight() }}
            onMouseLeave={this.unhighlightTrips}
          >
            {trips}
          </ul>
        </div>

        <div className="trips-footer">
          <div className="selection-control" onClick={this.toggleSelectAll} id="selectionControl">Select All</div>
          <OverlayTrigger
            placement="top"
            trigger="click"
            ref="exportPopover"
            overlay={exportPopover}
            rootClose={true}
          >
            <div className={classNames('export', { active: this.props.exporting })}><i></i> Export</div>
          </OverlayTrigger>
        </div>

        <Modal show={this.state.showModal} onHide={this.hideModal} className="trip-modal">
          <Modal.Body>
            <div className="close" onClick={this.hideModal}>x</div>
            <div className="trip-navigation">
              <div
                className={classNames('prev-trip', { disabled: this.state.modalTripIndex <= 1 })}
                onClick={this.showPreviousTrip}
              >Previous Trip</div>
              <span className="title">
                Trip {this.state.modalTripIndex} of {this.props.trips.length}
              </span>
              <div
                className={classNames('next-trip', { disabled: this.state.modalTripIndex >= this.props.trips.length })}
                onClick={this.showNextTrip}
              >Next Trip</div>
            </div>
            <div className="trip-details">
              <div className="trip-header">
                <div className="start">
                  <div className="time">
                    {moment(trip.started_at).format('h:mm A, MMM D, YYYY')}
                  </div>
                  <div className="location">
                    {trip.start_address.display_name}
                  </div>
                </div>
                <div className="end">
                  <div className="time">
                    {moment(trip.ended_at).format(tripSpansDay ? 'h:mm A, MMM D, YYYY' : 'h:mm A')}
                  </div>
                  <div className="location">
                    {trip.end_address.display_name}
                  </div>
                </div>
              </div>
              <div className="trip-stats">
                <div className="stat distance">
                  <div className="value">{formatters.distance(trip.distance_miles)}</div>
                  <label>Miles</label>
                </div>
                <div className="stat mpg">
                  <div className="value">{formatters.averageMPG(trip.average_mpg)}</div>
                  <label>MPG</label>
                </div>
                <div className="stat cost">
                  <div className="value">{formatters.costWithUnit(trip.fuel_cost_usd)}</div>
                  <label>Fuel</label>
                </div>
                <div className={classNames('duration', 'stat', { hours: trip.duration_s >= (60 * 60) })}>
                    <div className="value">{formatters.duration(trip.duration_s)}</div>
                    <label>{trip.duration_s >= (60 * 60) ? 'Hours' : 'Minutes'}</label>
                </div>
              </div>
              {businessTag}
            </div>
            <ModalMap trip={trip} />
          </Modal.Body>
        </Modal>

        <Modal show={this.state.showExportModal} onHide={this.hideExportModal} className="export-modal">
          <Modal.Body>
            <div className="close" onClick={this.hideExportModal}>x</div>
            <div>
              <h2>Export trips to .CSV</h2>
              <div className="csv-icon"></div>
              <p>
                Your trips will be downloaded as a file called "Unknown".
                To open it, you will need to rename it and add the ".csv" extension.
              </p>
              <a
                className="btn btn-blue btn-close"
                href={this.state.blobUrl}
                onClick={this.hideExportModal}
              >Download now</a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
TripList.propTypes = {
  allTrips: React.PropTypes.array,
  exporting: React.PropTypes.bool,
  filterHeight: React.PropTypes.number,
  getTrips: React.PropTypes.func.isRequired,
  trips: React.PropTypes.array,
  windowHeight: React.PropTypes.number
};

module.exports = TripList;
