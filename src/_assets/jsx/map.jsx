import React from 'react';

module.exports = class Map extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="map">
        <div className="map-container"></div>
        <div className="map-menu">
          <div className="zoom-control">
            <div className="zoom-in">+</div>
            <div className="zoom-out">&mdash;</div>
            <div className="auto-zoom">
              <label><input type="checkbox" /> Auto zoom</label>
            </div>
          </div>
          <div className="map-menu-right">
            <label><input type="checkbox" className="show-trip-events" /> View</label>
            <div className="trip-events grey">
              <div className="event">
                <div className="hard-brakes">0</div>
              </div>
              <div className="event">
                <div className="speeding">0</div>
              </div>
              <div className="event">
                <div className="hard-accels">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.createMap();
    this.updateMap();
  }

  componentDidUpdate() {
    this.updateMap();
  }
};
