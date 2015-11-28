import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import classNames from 'classnames';

const filters = require('../js/filters');
const formatters = require('../js/formatters');

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.formatVehicleMenuItem = (vehicle, key) => (
      <li
        onClick={this.updateFilter.bind(null, vehicle.id)}
        className={classNames({selected: this.props.value === vehicle.id})}
        key={key} >
        {formatters.formatVehicle(vehicle)} <i></i>
      </li>
    );

    this.updateFilter = (value) => {
      this.props.updateFilter(this.props.filterType, value);
      if(this.refs[`${this.props.filterType}Popover`]) {
        this.refs[`${this.props.filterType}Popover`].hide();
      }
    }
  }

  render() {
    let filter = filters.getFilter(this.props.filterType);

    let removeLink = (
      <div className="remove-filter" onClick={this.updateFilter.bind(null, null)}>
        Remove filter
      </div>
    )

    let popovers = {
      date: (
        <Popover id="date" title="Select Date Range" className="popover-date">
          <ul className="date-filter-value list-select animate">
            <li>this week <i></i></li>
            <li>this month <i></i></li>
            <li>in the last 30 days <i></i></li>
            <li>this year <i></i></li>
            <li>all time <i></i></li>
            <li>custom <i></i></li>
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
            {this.props.vehicles.map(this.formatVehicleMenuItem)}
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
        <OverlayTrigger placement="bottom" trigger="click" ref={`${this.props.filterType}Popover`} overlay={popovers[this.props.filterType]}>
          <div className="btn btn-filter btn-popover">
            <span className="btn-text">{filter.valueText(this.props.value, this.props.vehicles)}</span> <i className="fa fa-angle-down fa-lg"></i>
          </div>
        </OverlayTrigger>
      </li>
    );
  }
}
