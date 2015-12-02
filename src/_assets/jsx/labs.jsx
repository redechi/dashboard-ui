import React from 'react';

const Header = require('./header.jsx');


module.exports = class Labs extends React.Component {
  render() {
    return (
      <div className="main">
        <Header />
        <div className="labs">
          <h1 className="page-title">Automatic Labs</h1>
          <p>Automatic Labs is a place where you can play with experimental visualizations, tools, and apps that aren't ready for primetime yet. As we work on them, we can't promise they won't change, break, or disappear. We also can't provide technical support for any of these experiments. Check them out!</p>
          <ul className="labs-list">
            <li>
              <a href="/labs/hyperlapse/index.html" className="labs-link">
                <img src="/_assets/images/labs/hyperlapse.gif" className="labs-icon" />
                <h3 className="labs-title">Hyperlapse Generator</h3>
                <div className="labs-description">
                  Re-live any of your past drives with Google Streetview imagery of the route stitched into a time-lapse video.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/heatmap/index.html" className="labs-link">
                <img src="/_assets/images/labs/heatmap.png" className="labs-icon" />
                <h3 className="labs-title">Heatmap</h3>
                <div className="labs-description">
                  Each place you've gone with Automatic shown as a heatmap.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/nightmap/index.html" className="labs-link">
                <img src="/_assets/images/labs/nightmap.png" className="labs-icon" />
                <h3 className="labs-title">Trip Line Map</h3>
                <div className="labs-description">
                  All of your driving ever overlaid on a minimial, nighttime map. Simple and beautiful.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/countymap/index.html" className="labs-link">
                <img src="/_assets/images/labs/countymap.png" className="labs-icon" />
                <h3 className="labs-title">County Driving Map</h3>
                <div className="labs-description">
                  A map of all US counties and states that you have driven to. Collect them all!
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/carbon/index.html" className="labs-link">
                <img src="/_assets/images/labs/carbon.png" className="labs-icon" />
                <h3 className="labs-title">Carbon Calculator</h3>
                <div className="labs-description">
                  Estimate your carbon footprint, Automatically.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/commute-analyzer/index.html" className="labs-link">
                <img src="/_assets/images/labs/commute-analyzer.png" className="labs-icon" />
                <h3 className="labs-title">Commute Analyzer</h3>
                <div className="labs-description">
                  Break down your commute duration by direction, day of week and departure time.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/receipt/index.html" className="labs-link">
                <img src="/_assets/images/labs/receipt.png" className="labs-icon" />
                <h3 className="labs-title">Trip Receipts</h3>
                <div className="labs-description">
                  Download or print a receipt with a map for any trip you've taken with Automatic.
                </div>
              </a>
            </li>
            <li>
              <a href="/labs/relocate/index.html" className="labs-link">
                <img src="/_assets/images/labs/relocate.png" className="labs-icon" />
                <h3 className="labs-title">Relocate your commute</h3>
                <div className="labs-description">
                  Map your current commute patterns on top of a different city. See your daily drives along the canals of Venice or the beaches of Rio.
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
};
