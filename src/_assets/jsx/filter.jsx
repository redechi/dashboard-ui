import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';

const filters = require('../js/filters');

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let filter = filters.getFilter(this.props.filterType);

    let removeLink = (
      <div className="remove-filter" onClick={this.props.removeFilter.bind(null, this.props.filterType)}>
        Remove filter
      </div>
    )

    let popovers = {
      date: (
        <Popover id="date" title="Select Date Range" className="popover-date">
          <ul className="date-filter-value list-select animate">
            <li data-value="thisWeek">this week <i></i></li>
            <li data-value="thisMonth">this month <i></i></li>
            <li data-value="last30Days" className="selected">in the last 30 days <i></i></li>
            <li data-value="thisYear">this year <i></i></li>
            <li data-value="allTime">all time <i></i></li>
            <li data-value="custom">custom <i></i></li>
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
            <li data-value="all">All my vehicles <i></i></li>
            <li className="hide" data-value="other">Other vehicle(s) <i></i></li>
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
            <span className="btn-text">{filter.valueText(this.props.value)}</span> <i className="fa fa-angle-down fa-lg"></i>
          </div>
        </OverlayTrigger>
      </li>
    );
  }
}
