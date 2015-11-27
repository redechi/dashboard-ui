import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';

const Dashboard = require('./dashboard.jsx');
const Home = require('./home.jsx');
const Labs = require('./labs.jsx');
const NoMatch = require('./nomatch.jsx');

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('app'));
