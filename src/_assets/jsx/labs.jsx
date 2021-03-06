import React from 'react';

const login = require('../js/login');
const currentYear = (new Date()).getFullYear();
/* jscs:disable maximumLineLength */
/* eslint-disable max-len */
const labs = [
  {
    name: 'year-in-review',
    image: '/_assets/images/labs/year-in-review.png',
    title: `${currentYear} Year In Review`,
    description: `A summary of your driving in ${currentYear}.`
  },
  {
    name: 'car-behavior',
    image: '/_assets/images/labs/car-behavior.png',
    title: 'Car Health and Driving Style',
    description: 'Gain deep insight into your car’s fuel efficiency, power, and your aggressiveness.'
  },
  {
    name: 'dtc_codes',
    image: '/_assets/images/labs/dtc-codes.png',
    title: 'Diagnostic Trouble Codes',
    description: 'What diagnostic trouble codes has your car triggered?'
  },
  {
    name: 'battery',
    image: '/_assets/images/labs/battery.png',
    title: 'Battery Health',
    description: 'Can your car battery hold a charge?'
  },
  {
    name: 'commute-analyzer',
    image: '/_assets/images/labs/commute-analyzer.png',
    title: 'Commute Analyzer',
    description: 'Break down your commute duration by direction, day of week and departure time.'
  },
  {
    name: 'hyperlapse',
    image: '/_assets/images/labs/hyperlapse.gif',
    title: 'Hyperlapse Generator',
    description: 'Re-live any of your past drives with Google Streetview imagery of the route stitched into a time-lapse video.'
  },
  {
    name: 'heatmap',
    image: '/_assets/images/labs/heatmap.png',
    title: 'Heatmap',
    description: 'Each place you\'ve gone with Automatic shown as a heatmap.'
  },
  {
    name: 'nightmap',
    image: '/_assets/images/labs/nightmap.png',
    title: 'Trip Line Map',
    description: 'All of your driving ever overlaid on a minimial, nighttime map. Simple and beautiful.'
  },
  {
    name: 'countymap',
    image: '/_assets/images/labs/countymap.png',
    title: 'County Driving Map',
    description: 'A map of all US counties and states that you have driven to. Collect them all!'
  },
  {
    name: 'carbon',
    image: '/_assets/images/labs/carbon.png',
    title: 'Carbon Calculator',
    description: 'Estimate your carbon footprint, Automatically.'
  },
  {
    name: 'receipt',
    image: '/_assets/images/labs/receipt.png',
    title: 'Trip Receipts',
    description: 'Download or print a receipt with a map for any trip you\'ve taken with Automatic.'
  },
  {
    name: 'relocate',
    image: '/_assets/images/labs/relocate.png',
    title: 'Relocate your commute',
    description: 'Map your current commute patterns on top of a different city. See your daily drives along the canals of Venice or the beaches of Rio.'
  }
];

/* eslint-enable max-len */
/* jscs:enable maximumLineLength */

function Lab(props) {
  const demoParam = props.isLoggedIn ? '' : '?demo';

  return (
    <li>
      <a href={`/labs/${props.lab.name}/index.html${demoParam}`} className="labs-link">
        <img src={props.lab.image} className="labs-icon" />
        <h3 className="labs-title">{props.lab.title}</h3>
        <div className="labs-description">{props.lab.description}</div>
      </a>
    </li>
  );
}

Lab.propTypes = {
  isLoggedIn: React.PropTypes.bool,
  lab: React.PropTypes.object.isRequired
};

class Labs extends React.Component {
  render() {
    const labsList = labs.map((lab, key) => <Lab key={key} lab={lab} isLoggedIn={login.isLoggedIn()} />);

    return (
      <div className="main-container">
        <div className="labs">
          <h1 className="page-title">Automatic Labs</h1>
          <p>
            Automatic Labs is a place where you can play with experimental visualizations, tools,
            and apps that aren't ready for primetime yet.
            As we work on them, we can't promise they won't change, break, or disappear.
            We also can't provide technical support for any of these experiments.
            Check them out!
          </p>
          <ul className="labs-list">
            {labsList}
          </ul>
        </div>
      </div>
    );
  }
}

module.exports = Labs;
