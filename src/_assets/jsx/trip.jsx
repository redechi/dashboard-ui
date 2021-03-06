import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

const formatters = require('../js/formatters');
const highlight = require('../js/highlight');
const select = require('../js/select');

const TripTag = require('./trip_tag.jsx');

class Trip extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelectChange = () => {
      select.toggleSelect(this.props.trip);
    };

    this.showTripModal = (e) => {
      // Allow clicking on checkbox to select trip
      if (e.target.className !== 'trip-select') {
        this.props.showTripModal(this.props.trip);
      }
    };

    this.highlightTrips = () => {
      highlight.highlightTrips([this.props.trip], true);
    };

    this.unhighlightTrips = () => {
      highlight.unhighlightTrips();
    };
  }

  render() {
    const trip = this.props.trip;
    const tagged = _.contains(trip.tags, 'business');

    return (
      <li
        id={trip.id}
        onMouseEnter={this.highlightTrips}
        onMouseLeave={this.unhighlightTrips}
        onClick={this.showTripModal}
      >
        <div className="time-box">
          <div className="end-time">
            {moment(trip.ended_at).format('h:mm a').toUpperCase()}
          </div>
          <div>
            {moment(trip.ended_at).calendar()}
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
            {trip.end_address.display_name}
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
            {trip.start_address.display_name}
          </div>

          <TripTag
            tagged={tagged}
            tripId={trip.id}
            type={'small'}
            updateTripTag={this.props.updateTripTag}
          />
        </div>

        <input type="checkbox" className="trip-select" onChange={this.handleSelectChange} />
      </li>
    );
  }
}

Trip.propTypes = {
  trip: React.PropTypes.object.isRequired,
  updateTripTag: React.PropTypes.func.isRequired,
  showTripModal: React.PropTypes.func.isRequired
};

module.exports = Trip;
