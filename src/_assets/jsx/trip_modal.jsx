import React from 'react';
import { Modal } from 'react-bootstrap';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';

const formatters = require('../js/formatters');

const ModalMap = require('./trip_modal_map.jsx');
const TripTag = require('./trip_tag.jsx');

class TripModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const trip = this.props.trip;
    const tagged = _.contains(trip.tags, 'business');
    const tripSpansDay = moment(trip.started_at).dayOfYear() === moment(trip.ended_at).dayOfYear();

    return (
      <Modal show={this.props.showTripModal} onHide={this.props.hideTripModal} className="trip-modal">
        <Modal.Body>
          <div className="close" onClick={this.props.hideTripModal}>x</div>
          <div className="trip-navigation">
            <div
              className={classNames('prev-trip', { disabled: this.props.modalTripIndex <= 1 })}
              onClick={this.props.showPreviousTrip}
            >Previous Trip</div>
            <span className="title">
              Trip {this.props.modalTripIndex} of {this.props.tripCount}
            </span>
            <div
              className={classNames('next-trip', { disabled: this.props.modalTripIndex >= this.props.tripCount })}
              onClick={this.props.showNextTrip}
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
            <TripTag
              tagged={tagged}
              tripId={trip.id}
              type={'large'}
              updateTripTag={this.props.updateTripTag}
            />
          </div>
          <ModalMap trip={trip} />
        </Modal.Body>
      </Modal>
    );
  }
}
TripModal.propTypes = {
  hideTripModal: React.PropTypes.func.isRequired,
  modalTripIndex: React.PropTypes.number.isRequired,
  showNextTrip: React.PropTypes.func.isRequired,
  showPreviousTrip: React.PropTypes.func.isRequired,
  showTripModal: React.PropTypes.bool.isRequired,
  trip: React.PropTypes.object.isRequired,
  tripCount: React.PropTypes.number.isRequired,
  updateTripTag: React.PropTypes.func.isRequired
};

module.exports = TripModal;
