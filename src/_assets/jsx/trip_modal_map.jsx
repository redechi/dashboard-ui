import React from 'react';
import classNames from 'classnames';

const formatters = require('../js/formatters');
const map = require('../js/trip_modal_map');

class TripModalMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTripEvents: true
    };

    this.toggleTripEvents = () => {
      if (this.refs.showTripEvents.checked) {
        map.showTripEvents();
      } else {
        map.hideTripEvents();
      }

      this.setState({
        showTripEvents: this.refs.showTripEvents.checked
      });
    };
  }

  componentDidMount() {
    map.createMap();
    map.updateMap(this.props.trip);
    this.toggleTripEvents();
  }

  componentDidUpdate() {
    map.updateMap(this.props.trip);
  }

  render() {
    return (
      <div className="map">
        <div className="map-container" id="modalMapContainer"></div>
        <div className="map-menu">
          <div className="zoom-control">
            <div className="zoom-in" onClick={map.zoomIn}>+</div>
            <div className="zoom-out" onClick={map.zoomOut}>&mdash;</div>
          </div>
          <div className="map-menu-right">
            <label>
              <input
                type="checkbox"
                className="show-trip-events"
                ref="showTripEvents"
                onChange={this.toggleTripEvents}
                defaultChecked="true"
              /> View
            </label>
            <div className={classNames('trip-events', { grey: !this.state.showTripEvents })}>
              <div className="event">
                <div className={classNames('hard-brakes', { none: this.props.trip.hard_brakes === 0 })}>
                  {this.props.trip.hard_brakes}
                </div>
              </div>
              <div className="event">
                <div className={classNames('speeding', { none: this.props.trip.duration_over_70_s === 0 })}>
                  {formatters.durationMinutes(this.props.trip.duration_over_70_s)}
                </div>
              </div>
              <div className="event">
                <div className={classNames('hard-accels', { none: this.props.trip.hard_accels === 0 })}>
                  {this.props.trip.hard_accels}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
TripModalMap.propTypes = {
  trip: React.PropTypes.object.isRequired
};

module.exports = TripModalMap;
