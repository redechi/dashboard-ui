import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import Slider from 'bootstrap-slider';

const filters = require('../js/filters');
const formatters = require('../js/formatters');

const ListItem = require('./list_item.jsx');

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rootClose: true
    };

    this.updateFilter = (value) => {
      this.props.updateFilter(this.props.filterType, value, (dontClosePopover) => {
        const filterValueComponents = (value || '').split(',');
        if (this.refs[`${this.props.filterType}Popover`]) {
          if (this.props.filterType === 'date' || this.props.filterType === 'vehicle') {
            if (this.props.filterType !== 'date' || filterValueComponents[2] !== 'custom') {
              this.setState({
                rootClose: true
              });
              if (!dontClosePopover) {
                this.refs[`${this.props.filterType}Popover`].hide();
              }
            } else {
              this.setState({
                rootClose: false
              });
            }
          }
        }
      });
    };

    this.preparePopover = () => {
      if (_.contains(['distance', 'duration', 'cost', 'time'], this.props.filterType)) {
        const min = this.props.ranges[this.props.filterType][0];
        const max = this.props.ranges[this.props.filterType][1];
        const value = this.props.value.split(',').map(d => Math.min(Math.max(d, min), max));

        new Slider(`.popover-${this.props.filterType} input.slider`, {
          min,
          max,
          value,
          tooltip: 'hide'
        })
        .on('change', (results) => {
          this.setState({
            value: results.newValue.join(',')
          });
        })
        .on('slideStop', (newValue) => {
          this.updateFilter(newValue.join(','));
          this.setState({
            value: undefined
          });
        });
      }
    };

    this.handleStartDateChange = (startDate) => {
      const filterValueComponents = this.props.value.split(',');

      filterValueComponents[0] = startDate.valueOf();
      this.updateFilter(filterValueComponents.join(','));
    };

    this.handleEndDateChange = (endDate) => {
      const filterValueComponents = this.props.value.split(',');

      filterValueComponents[1] = endDate.endOf('day').valueOf();
      this.updateFilter(filterValueComponents.join(','));
    };
  }

  componentDidMount() {
    // only show popovers on filter add after initial filters applied
    if (this.props.showPopover) {
      this.refs[`${this.props.filterType}Popover`].show();
    }
  }

  formatVehicleMenuItem(vehicle) {
    vehicle.name = formatters.formatVehicle(vehicle);
    return vehicle;
  }

  render() {
    const filter = filters.getFilter(this.props.filterType);
    const filterValueComponents = this.props.value.split(',');

    const removeLink = (
      <div className="remove-filter" onClick={this.updateFilter.bind(null, null)}>
        Remove filter
      </div>
    );

    const endOfDay = moment().endOf('day').valueOf();

    const dateFilterOptions = [
      {
        name: 'this week',
        value: `${moment().startOf('week').valueOf()},${moment().endOf('week').valueOf()},thisWeek`
      },
      {
        name: 'this month',
        value: `${moment().startOf('month').valueOf()},${moment().endOf('month').valueOf()},thisMonth`
      },
      {
        name: 'in the last 30 days',
        value: `${moment().endOf('day').subtract(29, 'days').startOf('day').valueOf()},${endOfDay},last30Days`
      },
      {
        name: 'this year',
        value: `${moment().startOf('year').valueOf()},${endOfDay},thisYear`
      },
      {
        name: 'all time',
        value: `1363071600000,${endOfDay},allTime`
      },
      {
        name: 'custom',
        value: `${filterValueComponents[0]},${filterValueComponents[1]},custom`
      }
    ];

    const popovers = {
      date: (
        <Popover id="date" title="Select Date Range" className="popover-date">
          <ul className="date-filter-value list-select animate">
            {dateFilterOptions.map((dateFilter) =>
              <ListItem
                onItemClick={this.updateFilter}
                key={dateFilter.value}
                value={dateFilter.value}
                name={dateFilter.name}
                selected={this.props.value === dateFilter.value}
              />
            )}
          </ul>
          <div
            className="date-filter-custom"
            style={{ display: (filterValueComponents[2] === 'custom') ? 'block' : 'none' }}
          >
            <div className="input-group">
              <label>From</label>
              <DatePicker
                selected={moment(parseInt(filterValueComponents[0], 10))}
                onChange={this.handleStartDateChange}
                dateFormat="MM/DD/YY"
                className="datepicker__input form-control"
              />
            </div>
            <div className="input-group">
              <label>To</label>
              <DatePicker
                selected={moment(parseInt(filterValueComponents[1], 10))}
                onChange={this.handleEndDateChange}
                dateFormat="MM/DD/YY"
                className="datepicker__input form-control"
              />
            </div>
          </div>
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      vehicle: (
        <Popover id="vehicle" title="Select Vehicle" className="popover-vehicle">
          <ul className="list-select animate">
            <li
              className={classNames({ selected: this.props.value === 'all' })}
              onClick={this.updateFilter.bind(null, 'all')}
            >
              All my vehicles <i></i>
            </li>
            {this.props.vehicles.map(this.formatVehicleMenuItem).map((vehicleMenuItem) =>
              <ListItem
                onItemClick={this.updateFilter}
                key={vehicleMenuItem.id}
                value={vehicleMenuItem.id}
                name={vehicleMenuItem.name}
                selected={this.props.value === vehicleMenuItem.id}
              />
            )}
          </ul>
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      distance: (
        <Popover id="distance" title="Choose Distance Range" className="popover-distance">
          <input className="slider" />
          {removeLink}
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      duration: (
        <Popover id="duration" title="Choose Duration Range" className="popover-duration">
          <input className="slider" />
          {removeLink}
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      cost: (
        <Popover id="cost" title="Choose Cost Range" className="popover-cost">
          <input className="slider" />
          {removeLink}
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      time: (
        <Popover id="time" title="Choose Time of Day Range" className="popover-time">
          <input className="slider" />
          {removeLink}
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      ),
      businessTag: (
        <Popover id="businessTag" title="" className="popover-business-tag">
          {removeLink}
          <div className={classNames('no-matching-trips', { hide: !this.props.noMatchingTrips })}>
            No matching trips
          </div>
        </Popover>
      )
    };

    return (
      <li>
        <div className="filter-label">{filter.label}</div>
        <OverlayTrigger
          placement="bottom"
          trigger="click"
          ref={`${this.props.filterType}Popover`}
          overlay={popovers[this.props.filterType]}
          onEntered={this.preparePopover}
          rootClose={this.state.rootClose}
        >
          <div className="btn btn-filter btn-popover">
            <span className="btn-text">
              {filter.valueText(this.state.value || this.props.value, this.props.vehicles)}
            </span> <i className="fa fa-angle-down fa-lg"></i>
          </div>
        </OverlayTrigger>
      </li>
    );
  }
}
Filter.propTypes = {
  filterType: React.PropTypes.string,
  ranges: React.PropTypes.object,
  showPopover: React.PropTypes.bool,
  updateFilter: React.PropTypes.func.isRequired,
  value: React.PropTypes.string,
  vehicles: React.PropTypes.array
};

module.exports = Filter;
