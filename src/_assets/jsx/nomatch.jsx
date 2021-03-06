import React from 'react';
import { Link } from 'react-router';

class NoMatch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main-container">
        <div className="container no-match">
          <h1>This page cannot be found.</h1>
          <div className="big-alert"></div>
          <p>Oops!  The address you have entered is incorrect or the page no longer exists.</p>
          <Link to="/" className="btn btn-blue">Go to the Dashboard</Link>
        </div>
      </div>
    );
  }
}

module.exports = NoMatch;
