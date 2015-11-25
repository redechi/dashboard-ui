import React from 'react';

const login = require('../js/login.js');

const Dashboard = require('./dashboard.jsx');
const Login = require('./login.jsx');

module.exports = class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (login.isLoggedIn()) {
      return (
        <Dashboard />
      );
    } else {
      return (
        <Login />
      );
    }
  }
};
