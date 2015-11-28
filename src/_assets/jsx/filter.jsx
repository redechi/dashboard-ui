import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'underscore';
import classNames from 'classnames';
import moment from 'moment';
import Slider from 'bootstrap-slider';

const filters = require('../js/filters');
const formatters = require('../js/formatters');

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value
    };

    this.updateFilter = (value) => {
      this.setState({value: value});
      this.props.updateFilter(this.props.filterType, value);
      if(this.refs[`${this.props.filterType}Popover`]) {
        this.refs[`${this.props.filterType}Popover`].hide();
      }
    };

    this.preparePopover = () => {
      let filter = filters.getFilter(this.props.filterType);

      if(_.contains(['distance', 'duration', 'cost', 'time'], this.props.filterType)) {
        let min = this.props.ranges[this.props.filterType][0];
        let max = this.props.ranges[this.props.filterType][1];
        let value = this.props.value.split(',').map(d => Math.min(Math.max(d, min), max))
        var slider = new Slider(`.popover-${this.props.filterType} input.slider`, {
          min: min,
          max: max,
          value: value,
          tooltip: 'hide'
        })
        .on('change', (results) => {
          this.setState({value: results.newValue.join(',')});
        })
        .on('slideStop', (newValue) => {
          this.updateFilter(newValue.join(','));
        });
      }
    };
  }

  formatVehicleMenuItem(vehicle, key) {
    return (
      <li
        onClick={this.updateFilter.bind(null, vehicle.id)}
        className={classNames({selected: this.props.value === vehicle.id})}
        key={key} >
        {formatters.formatVehicle(vehicle)} <i></i>
      </li>
    );
  }

  formatDateMenuItem(option, key) {
    return (
      <li
        onClick={this.updateFilter.bind(null, option.value)}
        className={classNames({selected: this.props.value === option.value})}
        key={key} >
        {option.name} <i></i>
      </li>
    );
  }

  render() {
    let filter = filters.getFilter(this.props.filterType);

    let removeLink = (
      <div className="remove-filter" onClick={this.updateFilter.bind(null, null)}>
        Remove filter
      </div>
    );

    let dateFilterOptions = [
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
        value: `${moment().endOf('day').subtract(29, 'days').startOf('day').valueOf()},${moment().endOf('day').valueOf()},last30Days`
      },
      {
        name: 'this year',
        value: `${moment().startOf('year').valueOf()},${moment().endOf('day').valueOf()},thisYear`
      },
      {
        name: 'all time',
        value: `${this.props.ranges.date[0]},${moment().endOf('day').valueOf()},allTime`
      },
      {
        name: 'custom',
        value: `${this.props.ranges.date[0]},${moment().endOf('day').valueOf()},custom`
      }
    ];

    let popovers = {
      date: (
        <Popover id="date" title="Select Date Range" className="popover-date">
          <ul className="date-filter-value list-select animate">
            {dateFilterOptions.map(this.formatDateMenuItem.bind(this))}
          </ul>
          <div className="dateFilterCustom">
            <div className="input-group">
              <label>From</label>
              <input type="text" className="form-control" data-date-format="MM/DD/YY" />
            </div>
            <div className="input-group">
              <label>To</label>
              <input type="text" className="form-control" data-date-format="MM/DD/YY" />
            </div>
          </div>
        </Popover>
      ),
      vehicle: (
        <Popover id="vehicle" title="Select Vehicle" className="popover-vehicle">
          <ul className="list-select animate">
            <li
              className={classNames({selected: this.props.value === 'all'})}
              onClick={this.updateFilter.bind(null, 'all')}>
              All my vehicles <i></i>
            </li>
            {this.props.vehicles.map(this.formatVehicleMenuItem.bind(this))}
          </ul>
        </Popover>
      ),
      distance: (
        <Popover id="distance" title="Choose Distance Range" className="popover-distance">
          <input className="slider" />
          {removeLink}
        </Popover>
      ),
      duration: (
        <Popover id="duration" title="Choose Duration Range" className="popover-duration">
          <input className="slider" />
          {removeLink}
        </Popover>
      ),
      cost: (
        <Popover id="cost" title="Choose Cost Range" className="popover-cost">
          <input className="slider" />
          {removeLink}
        </Popover>
      ),
      time: (
        <Popover id="time" title="Choose Time of Day Range" className="popover-time">
          <input className="slider" />
          {removeLink}
        </Popover>
      ),
      businessTag: (
        <Popover id="businessTag" title="" className="popover-business-tag">
          {removeLink}
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
          onEntered={this.preparePopover}>
          <div className="btn btn-filter btn-popover">
            <span className="btn-text">{filter.valueText(this.state.value, this.props.vehicles)}</span> <i className="fa fa-angle-down fa-lg"></i>
          </div>
        </OverlayTrigger>
      </li>
    );
  }

  componentDidMount() {
    // only show popovers on filter add after initial filters applied
    if(this.props.showPopover) {
      this.refs[`${this.props.filterType}Popover`].show();
    }
  }
}
