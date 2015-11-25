import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
var classNames = require('classnames');
var _ = require('underscore');
var moment = require('moment');

const Trip = require('./trip.jsx');

const sortTypes = [
  {
    key: 'started_at',
    name: 'Time/Date'
  },
  {
    key: 'distance_m',
    name: 'Distance'
  },
  {
    key: 'average_mpg',
    name: 'MPG'
  },
  {
    key: 'fuel_cost_usd',
    name: 'Cost'
  },
  {
    key: 'duration_s',
    name: 'Duration'
  }
];

module.exports = class TripList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortType: 'started_at',
      sortDirection: 'down'
    };

    this.reverseSortDirection = () => {
      this.setState({sortDirection: this.state.sortDirection === 'down' ? 'up' : 'down'});
    };

    this.setSortType = (sortType) => {
      this.refs.sortTypePopover.hide();
      this.setState({sortType: sortType});
    };

    this.exportDone = (e) => {
      if(e && e === 'not_supported') {
        alert('Export is not supported in your browser. Please try again with IE10+, Chrome, Firefox or Safari.');
      }
      this.refs.exportPopover.hide();
    };
  }

  sortTrips() {
    return _.sortBy(this.props.trips, (trip) => {
      let direction = this.state.sortDirection === 'down' ? -1 : 1;
      if(this.state.sortType === 'started_at') {
        return moment(trip.started_at).valueOf() * direction;
      } else if(this.state.sortType === 'distance_m') {
        return trip.distance_m * direction;
      } else if(this.state.sortType === 'average_mpg') {
        return trip.average_mpg * direction;
      } else if(this.state.sortType === 'fuel_cost_usd') {
        return trip.fuel_cost_usd * direction;
      } else if(this.state.sortType === 'duration_s') {
        return trip.duration_s * direction;
      }
    });
  }

  getTripListHeight() {
    return this.props.windowHeight - 330;
  }

  render() {
    if(!this.props.trips) {
      return (<div/>);
    }

    let selectedSortType = _.find(sortTypes, (item) => item.key === this.state.sortType);

    let trips = this.sortTrips().map((trip, key) => {
      return (
        <Trip
          trip={trip}
          toggleSelect={this.props.toggleSelect}
          key={key}/>
      );
    });

    let sortTypePopover = (
      <Popover id="sortType" title="Sort By" className="popover-sort-type">
        <ul className="list-select animate">
          {sortTypes.map((sortType) => {
            return (
              <li onClick={this.setSortType.bind(null, sortType.key)} key={sortType.key}>
                {sortType.name}
              </li>
            )
          })}
        </ul>
      </Popover>
    );

    let selectedTripCount = _.size(_.filter(this.props.trips, (trip) => this.selected));

    let exportPopover = (
      <Popover id="export" title="Export trips to .csv" className="popover-export">
        <ul className="list-select animate">
          <li onClick={this.props.export.bind(null, 'selected', this.exportDone)}>Export selected trips ({selectedTripCount})</li>
          <li onClick={this.props.export.bind(null, 'tripList', this.exportDone)}>Export trips currently in trip list ({this.props.trips.length})</li>
          <li onClick={this.props.export.bind(null, 'all', this.exportDone)}>Export all trips</li>
        </ul>
      </Popover>
    );

    return (
      <div>
        <div className="trip-stats"></div>
        <div className="trips-header">
          <div className="trip-count">{this.props.trips.length} Trips</div>
          <div className={classNames('sort-direction', {'sort-up': this.state.sortDirection === 'up'})} onClick={this.reverseSortDirection}></div>
          <OverlayTrigger placement="bottom" trigger="click" ref="sortTypePopover" overlay={sortTypePopover}>
            <div className="sort-type">{selectedSortType.name} <i className="fa fa-angle-down fa-lg"></i></div>
          </OverlayTrigger>
        </div>

        <div className="trips">
          <ul style={{height: this.getTripListHeight()}}>
            {trips}
          </ul>
        </div>

        <div className="trips-footer">
          <div className="selection-control" onClick={this.props.toggleSelectAll}>
            {this.props.allSelected ? 'Deselect all' : 'Select all'}
          </div>
          <OverlayTrigger placement="top" trigger="click" ref="exportPopover" overlay={exportPopover}>
            <div className={classNames('export', {active: this.props.exporting})}><i></i> Export</div>
          </OverlayTrigger>
        </div>
      </div>
    );
  }
};
