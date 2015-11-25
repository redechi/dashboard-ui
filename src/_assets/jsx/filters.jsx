import React from 'react';

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    // <div className="popoverTemplate" data-filter="date" title="Select Date Range">
    //   <ul className="dateFilterValue listSelect animate">
    //     <li data-value="thisWeek">this week <i></i></li>
    //     <li data-value="thisMonth">this month <i></i></li>
    //     <li data-value="last30Days" className="selected">in the last 30 days <i></i></li>
    //     <li data-value="thisYear">this year <i></i></li>
    //     <li data-value="allTime">all time <i></i></li>
    //     <li data-value="custom">custom <i></i></li>
    //   </ul>
    //   <div className="dateFilterCustom">
    //     <div className="input-group">
    //       <label>From</label>
    //       <input type="text" type="text" className="form-control dateFilterValueCustomStart" data-date-format="MM/DD/YY">
    //     </div>
    //     <div className="input-group">
    //       <label>To</label>
    //       <input type="text" type="text" className="form-control dateFilterValueCustomEnd" data-date-format="MM/DD/YY">
    //     </div>
    //   </div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="vehicle" title="Select Vehicle">
    //   <ul className="vehicleFilterValue listSelect animate">
    //     <li data-value="all">All my vehicles <i></i></li>
    //     <li className="hide" data-value="other">Other vehicle(s) <i></i></li>
    //   </ul>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="distance" title="Choose Distance Range">
    //   <input className="distanceFilterValue slider">
    //   <div className="removeFilter" data-filter="distance">Remove filter</div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="duration" title="Choose Duration Range">
    //   <input className="durationFilterValue slider">
    //   <div className="removeFilter" data-filter="duration">Remove filter</div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="cost" title="Choose Cost Range">
    //   <input className="costFilterValue slider">
    //   <div className="removeFilter" data-filter="cost">Remove filter</div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="time" title="Choose Time of Day Range">
    //   <input className="timeFilterValue slider">
    //   <div className="removeFilter" data-filter="time">Remove filter</div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>
    //
    // <div className="popoverTemplate" data-filter="businessTag">
    //   <div className="removeFilter" data-filter="businessTag">Remove filter</div>
    //   <div className="noMatchingTrips">No matching trips</div>
    // </div>

    return (
      <div className="filters">
        <ul className="filter-controls">
          <label>Filters:</label>
          <li className="undo btn btn-filter disabled">Undo</li>
          <li className="reset btn btn-filter">Reset</li>
        </ul>

        <ul className="applied-filters">
          <li>
            <div className="filter-label">and</div>
            <div title="Add Filter" className="add-filter btn btn-filter btn-popover">+</div>
          </li>
        </ul>
      </div>
    );
  }
};
