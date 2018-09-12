import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { Modal } from 'react-bootstrap';

const login = require('../js/login');
const requests = require('../js/requests');

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getUser();
  }

  componentDidUpdate() {
    this.getUser();
  }

  getUser() {
    if (login.isLoggedIn()) {
      if (!this.state.firstName) {
        requests.getUser((e, user) => {
          if (e) {
            return;
          }

          this.setState({
            firstName: user.first_name
          });
        });
      }
    } else if (this.state.firstName) {
      this.setState({
        firstName: undefined
      });
    }
  }

  isExcludedPage() {
    return this.props.location.pathname === '/' || this.props.location.pathname === '/reset';
  }
  render() {
    // Don't show header on login page or reset page
    if (!login.isLoggedIn() && this.props.location && this.isExcludedPage()) {
      return (<div></div>);
    }

    let menu;

    if (login.isLoggedIn()) {
      menu = (
        <ul className="menu">
          <li>
            <Link to="/">Summary</Link>
          </li>
          <li>
            <a href={login.apiUrl}>Apps</a>
          </li>
          <li>
            <Link to="/labs">Labs</Link>
          </li>
          <li className="support">
            <a href="https://help.automatic.com">Support</a>
          </li>
          <li>
            <span className="first-name">{this.state.firstName}</span>
            <Link to="/logout">Log out</Link>
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
            <Link to="/labs">Labs</Link>
          </li>
          <li>
            <Link to="/">Log In</Link>
          </li>
          <li className="menu-button">
            <a href="https://automatic.com/adapter" className="btn btn-white">Buy Now</a>
          </li>
        </ul>
      );
    }

    return (
      <header className={classNames({ 'logged-in': login.isLoggedIn() })}>
        <Link to="/">
          <div className="header-logo">
            <div className="demo-tag">demo</div>
          </div>
        </Link>
        {menu}
      </header>
    );
  }
}
Header.propTypes = {
  location: React.PropTypes.object
};

module.exports = Header;
