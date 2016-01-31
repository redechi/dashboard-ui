import React from 'react';

const login = require('../js/login');

class Logout extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    login.logout();
    window.location = '/';
  }

  render() {
    return (
      <div className="main-container">
        <div className="container">
          <h1>Logging out</h1>
        </div>
      </div>
    );
  }
}

module.exports = Logout;
