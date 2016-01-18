import React from 'react';
import classNames from 'classnames';

const map = require('../js/map');

class Map extends React.Component {
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

    this.toggleAutozoom = () => {
      map.setAutozoom(this.refs.autoZoom.checked);
    };
  }

  componentDidMount() {
    map.createMap();
    map.updateMap(this.props.trips);
    this.toggleTripEvents();
  }

  componentDidUpdate() {
    map.updateMap(this.props.trips);
  }

  getMapHeight() {
    const verticalPadding = 367;
    return this.props.windowHeight - this.props.filterHeight - verticalPadding;
  }

  render() {
    const totals = this.props.totals || {};

    return (
      <div className="map">
        <div className="map-container" id="overviewMapContainer" style={{ height: this.getMapHeight() }}></div>
        <div className="map-menu">
          <div className="zoom-control">
            <div className="zoom-in" onClick={map.zoomIn}>+</div>
            <div className="zoom-out" onClick={map.zoomOut}>&mdash;</div>
            <div className="auto-zoom">
              <label><input type="checkbox" ref="autoZoom" onChange={this.toggleAutozoom} /> Auto zoom</label>
            </div>
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
                <div className={classNames('hard-brakes', { none: totals.hardBrakes === 0 })}>
                  {totals.hardBrakes}
                </div>
              </div>
              <div className="event">
                <div className={classNames('speeding', { none: totals.speedingMinutes === 0 })}>
                  {totals.speedingMinutes}
                </div>
              </div>
              <div className="event">
                <div className={classNames('hard-accels', { none: totals.hardAccels === 0 })}>
                  {totals.hardAccels}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Map.propTypes = {
  filterHeight: React.PropTypes.number,
  totals: React.PropTypes.object,
  trips: React.PropTypes.array,
  windowHeight: React.PropTypes.number
};

module.exports = Map;
