import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';

const ConnectedApps = require('./connected_apps.jsx');
const Dashboard = require('./dashboard.jsx');
const Home = require('./home.jsx');
const Labs = require('./labs.jsx');
const NoMatch = require('./nomatch.jsx');
const UnsupportedBrowser = require('./unsupported_browser.jsx');

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  isBrowserSupported() {
    return Modernizr.svg && Modernizr.cors && window.location.search.indexOf('unsupported') === -1;
  }

  render() {
    if(!this.isBrowserSupported()) {
      return <UnsupportedBrowser />;
    }

    return (
      <div>
        {React.cloneElement(this.props.children)}
      </div>
    );
  }
}


render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="demo" component={Dashboard}/>
      <Route path="labs" component={Labs}/>
      <Route path="connected-apps" component={ConnectedApps}/>
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('app'));
