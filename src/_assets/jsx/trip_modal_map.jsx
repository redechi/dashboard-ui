import React from 'react';
import classNames from 'classnames';

const map = require('../js/trip_modal_map');

module.exports = class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTripEvents: true
    };

    this.toggleTripEvents = () => {
      if(this.refs.showTripEvents.checked) {
        map.showTripEvents();
      } else {
        map.hideTripEvents();
      }

      this.setState({showTripEvents: this.refs.showTripEvents.checked});
    };
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
                defaultChecked={true} /> View
            </label>
            <div className={classNames('trip-events', {grey: !this.state.showTripEvents})}>
              <div className="event">
                <div className={classNames('hard-brakes', {none: this.props.trip.hard_brakes === 0})}>
                  {this.props.trip.hard_brakes}
                </div>
              </div>
              <div className="event">
                <div className={classNames('speeding', {none: this.props.trip.duration_over_70_min === 0})}>
                  {this.props.trip.duration_over_70_min}
                </div>
              </div>
              <div className="event">
                <div className={classNames('hard-accels', {none: this.props.trip.hard_accels === 0})}>
                  {this.props.trip.hard_accels}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    map.createMap();
    map.updateMap(this.props.trip);
    this.toggleTripEvents();
  }

  componentDidUpdate() {
    map.updateMap(this.props.trip);
  }
};
