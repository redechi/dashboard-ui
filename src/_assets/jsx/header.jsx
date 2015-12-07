import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { Modal } from 'react-bootstrap';

const login = require('../js/login');
const requests = require('../js/requests');


module.exports = class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSupportModal: false
    };

    this.showSupportModal = () => {
      this.setState({showSupportModal: true});

      GSFN.loadWidget(7392, {containerId: 'getsat-widget-7392'});
    }

    this.hideSupportModal = () => {
      this.setState({showSupportModal: false});
    }
  }

  getUser() {
    if(login.isLoggedIn()) {
      if(!this.state.firstName) {
        requests.getUser((e, user) => {
          if(e) {
            return;
          }
          this.setState({firstName: user.first_name});
        });
      }
    } else if(this.state.firstName) {
      this.setState({firstName: undefined});
    }
  }

  render() {
    // Don't show header on login page or reset page
    if(!login.isLoggedIn() && this.props.location && (this.props.location.pathname === '/' || this.props.location.pathname === '/reset')) {
      return (<div></div>);
    }

    let menu;

    if(login.isLoggedIn()) {
      menu = (
        <ul className="menu">
          <li>
            <Link to="/">Summary</Link>
          </li>
          <li>
            <Link to="/connected-apps">Apps</Link>
          </li>
          <li>
            <Link to="/labs">Labs</Link>
          </li>
          <li className="support">
            <a onClick={this.showSupportModal}>Support</a>
          </li>
          <li>
            <span className="first-name">{this.state.firstName}</span>
            <Link to="/" onClick={login.logout}>Log out</Link>
          </li>
          <Modal show={this.state.showSupportModal} onHide={this.hideSupportModal} className="support-modal">
            <Modal.Body>
              <div className="close" onClick={this.hideSupportModal}>x</div>
              <div id="getsat-widget-7392"></div>
            </Modal.Body>
          </Modal>
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

  componentDidMount() {
    this.getUser();
  }

  componentDidUpdate() {
    this.getUser();
  }
};
