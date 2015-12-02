import React from 'react';

module.exports = class UnsupportedBrowser extends React.Component {
  render() {
    return (
      <div className="unsupported-browser">
        <h2>Sorry! Your browser is not supported.</h2>
        <div className="big-alert"></div>
        <p>In order to maintain the best experience and provide full functionality on our dashboard, we recommend using one of the following desktop web browsers:</p>
        <div className="supported-browsers">
          <a href="http://www.google.com/chrome/">Chrome</a> &bull;
          <a href="http://www.mozilla.com/firefox/">Firefox</a> &bull;
          <a href="http://www.apple.com/safari/download/">Safari</a>
        </div>
      </div>
    );
  }
}
