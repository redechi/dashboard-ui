import React from 'react';

module.exports = class TripStats extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(!this.props.trips) {
      return (<div />);
    } else if(!this.props.trips.length) {
      return (
        <div className="trip-stats no-trips">
          <div className="alert-grey">No trips match these criteria</div>
        </div>
      );
    } else {
      return (
        <div className="trip-stats">
          <div className="stat distance">
            <div className="value">{this.props.totals.distance}</div>
            <div className="label">Miles</div>
          </div>
          <div className="stat mpg active">
            <div className="value">{this.props.totals.mpg}</div>
            <div className="label">MPG</div>
          </div>
          <div className="stat cost">
            <div className="value">{this.props.totals.cost}</div>
            <div className="label">Fuel</div>
          </div>
          <div className="stat duration">
            <div className="value">{this.props.totals.duration}</div>
            <div className="label">Hours</div>
          </div>
        </div>
      );
    }
  }
};
