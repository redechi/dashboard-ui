import React from 'react';
import classNames from 'classnames';

const requests = require('../js/requests');

class TripTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      tagged: props.tagged
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tagged !== this.state.tagged) {
      this.setState({ tagged: nextProps.tagged });
    }
  }

  toggleTag(event) {
    const tripId = this.props.tripId;
    const newTagState = !this.state.tagged;
    const request = (newTagState === true) ? requests.setTripTag : requests.deleteTripTag;

    event.stopPropagation();

    if (!this.state.loading) {
      this.setState({
        loading: true,
        tagged: newTagState
      });

      request(tripId, (err) => {
        this.setState({ loading: false });

        if (!err) {
          this.props.updateTripTag(tripId, newTagState);
        } else {
          requests.getTripTag(tripId, (error, response) => {
            if (!error) {
              this.props.updateTripTag(tripId, !!response);
            } else {
              this.setState({ tagged: !newTagState });
            }
          });
        }
      });
    }
  }

  render() {
    const type = this.props.type || 'small';
    const tagged = this.state.tagged;
    const className = classNames('trip-tag', type, { tagged });
    const label = tagged ? 'Tagged' : 'Not Tagged';

    return (
      <button
        className={className}
        title="Tag as business trip"
        onClick={(event) => { this.toggleTag(event); }}
      ><span className="label">{label}</span></button>
    );
  }
}

TripTag.propTypes = {
  tagged: React.PropTypes.bool.isRequired,
  updateTripTag: React.PropTypes.func.isRequired,
  tripId: React.PropTypes.string.isRequired,
  type: React.PropTypes.string
};

module.exports = TripTag;
