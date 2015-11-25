import React from 'react';
import { Link } from 'react-router';
var classNames = require('classnames');
var login = require('../js/login');

module.exports = class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let menu;

    if(login.isLoggedIn()) {
      menu = (
        <ul className="menu">
          <li>
            <Link to="/">Summary</Link>
          </li>
          <li>
            <Link to="connected_apps">Apps</Link>
          </li>
          <li>
            <Link to="labs">Labs</Link>
          </li>
          <li className="support">
            <a href="#">Support</a>
          </li>
          <li>
            <span className="first-name"></span>
            <Link to="logout">Log out</Link>
          </li>
        </ul>
      );
    } else {
      menu = (
        <ul className="menu">
          <li>
            <a href="https://www.automatic.com">What is Automatic?</a>
          </li>
          <li>
            <Link to="labs">Labs</Link>
          </li>
          <li>
            <a to="/">Log In</a>
          </li>
          <li className="menu-button">
            <a href="https://store.automatic.com" className="btn btn-white">Buy Now $99.95</a>
          </li>
        </ul>
      );
    }

    return (
      <header className={classNames({'logged-in': login.isLoggedIn()})}>
        <Link to="/">
          <div className="header-logo">
            <div className="demo-tag">demo</div>
          </div>
        </Link>
        {menu}
      </header>
    );
  }
};
