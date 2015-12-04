import React from 'react';

const login = require('../js/login');


class Lab extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let demoParam = this.props.isLoggedIn ? '' : '?demo';

    return (
      <li>
        <a href={`/labs/${this.props.lab.name}/index.html${demoParam}`} className="labs-link">
          <img src={`/_assets/images/labs/${this.props.lab.image}`} className="labs-icon" />
          <h3 className="labs-title">{this.props.lab.title}</h3>
          <div className="labs-description">{this.props.lab.description}</div>
        </a>
      </li>
    );
  }
}


module.exports = class Labs extends React.Component {
  render() {
    let isLoggedIn = login.isLoggedIn();

    let labs = [
      {
        name: 'hyperlapse',
        image: 'hyperlapse.gif',
        title: 'Hyperlapse Generator',
        description: 'Re-live any of your past drives with Google Streetview imagery of the route stitched into a time-lapse video.'
      },
      {
        name: 'heatmap',
        image: 'heatmap.png',
        title: 'Heatmap',
        description: 'Each place you\'ve gone with Automatic shown as a heatmap.'
      },
      {
        name: 'nightmap',
        image: 'nightmap.png',
        title: 'Trip Line Map',
        description: 'All of your driving ever overlaid on a minimial, nighttime map. Simple and beautiful.'
      },
      {
        name: 'countymap',
        image: 'countymap.png',
        title: 'County Driving Map',
        description: 'A map of all US counties and states that you have driven to. Collect them all!'
      },
      {
        name: 'carbon',
        image: 'carbon.png',
        title: 'Carbon Calculator',
        description: 'Estimate your carbon footprint, Automatically.'
      },
      {
        name: 'commute-analyzer',
        image: 'commute-analyzer.png',
        title: 'Commute Analyzer',
        description: 'Break down your commute duration by direction, day of week and departure time.'
      },
      {
        name: 'receipt',
        image: 'receipt.png',
        title: 'Trip Receipts',
        description: 'Download or print a receipt with a map for any trip you\'ve taken with Automatic.'
      },
      {
        name: 'relocate',
        image: 'relocate.png',
        title: 'Relocate your commute',
        description: 'Map your current commute patterns on top of a different city. See your daily drives along the canals of Venice or the beaches of Rio.'
      }
    ];

    let labsList = labs.map((lab, key) => <Lab key={key} lab={lab} isLoggedIn={isLoggedIn} />);

    return (
      <div className="main">
        <div className="labs">
          <h1 className="page-title">Automatic Labs</h1>
          <p>Automatic Labs is a place where you can play with experimental visualizations, tools, and apps that aren't ready for primetime yet. As we work on them, we can't promise they won't change, break, or disappear. We also can't provide technical support for any of these experiments. Check them out!</p>
          <ul className="labs-list">
            {labsList}
          </ul>
        </div>
      </div>
    );
  }
};
