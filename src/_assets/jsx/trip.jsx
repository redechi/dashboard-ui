import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

const formatters = require('../js/formatters');
const highlight = require('../js/highlight');
const select = require('../js/select');

class Trip extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelectChange = () => {
      select.toggleSelect(this.props.trip);
    };

    this.showModal = (e) => {
      // Allow clicking on checkbox to select trip
      if (e.target.className !== 'trip-select') {
        this.props.showModal(this.props.trip);
      }
    };

    this.highlightTrips = () => {
      highlight.highlightTrips([this.props.trip]);
    };

    this.unhighlightTrips = () => {
      highlight.unhighlightTrips();
    };
  }

  render() {
    const trip = this.props.trip;
    let businessTag;

    if (_.contains(trip.tags, 'business')) {
      businessTag = (
        <div className="tagged-business" title="Tagged as business trip">Tagged as business trip</div>
      );
    }

    return (
      <li
        id={trip.id}
        onMouseEnter={this.highlightTrips}
        onMouseLeave={this.unhighlightTrips}
        onClick={this.showModal}
      >
        <div className="time-box">
          <div className="end-time">
            {moment(trip.ended_at).format('h:mm a').toUpperCase()}
          </div>
          <div>
            {moment(trip.started_at).calendar()}
          </div>
          <div className="start-time">
            {moment(trip.started_at).format('h:mm a').toUpperCase()}
          </div>
        </div>

        <div className="trip-line">
          <div>B</div>
          <div>A</div>
        </div>

        <div className="trip-details">
          <div className="location">
            {trip.end_address ? trip.end_address.display_name : 'Unknown Address'}
          </div>

          <div className="middle-box">
            <div className="distance stat">
              {formatters.distance(trip.distance_miles)}
            </div>
            <div className="mpg stat">
              {formatters.averageMPG(trip.average_mpg)}
            </div>
            <div className="cost stat">
              {formatters.cost(trip.fuel_cost_usd)}
            </div>
            <div className={classNames('duration', 'stat', { hours: trip.duration_s >= (60 * 60) })}>
              {formatters.duration(trip.duration_s)}
            </div>
          </div>

          <div className="trip-events">
            <div className="event">
              <div className={classNames('hard-brakes', { none: trip.hard_brakes === 0 })}>
                {trip.hard_brakes}
              </div>
            </div>
            <div className="event">
              <div className={classNames('speeding', { none: trip.duration_over_70_s === 0 })}>
                {formatters.durationMinutes(trip.duration_over_70_s)}
              </div>
            </div>
            <div className="event">
              <div className={classNames('hard-accels', { none: trip.hard_accels === 0 })}>
                {trip.hard_accels}
              </div>
            </div>
          </div>

          <div className="location">
            {trip.start_address ? trip.start_address.display_name : 'Unknown Address'}
          </div>
          {businessTag}
        </div>

        <input type="checkbox" className="trip-select" onChange={this.handleSelectChange} />
      </li>
    );
  }
}
Trip.propTypes = {
  trip: React.PropTypes.object.isRequired,
  showModal: React.PropTypes.func.isRequired
};

module.exports = Trip;
