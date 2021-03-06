import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import _ from 'lodash';

const login = require('../js/login');
const mobile = require('../js/mobile');

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panel: 'intro'
    };

    this.toggleLoginPanel = (event) => {
      event.preventDefault();

      this.setState({
        panel: this.state.panel === 'intro' ? 'login' : 'intro'
      });
    };

    this.login = (event) => {
      event.preventDefault();
      this.setState({
        alert: 'Logging in'
      });
      login.login(this.refs.username.value, this.refs.password.value, this.refs.staySignedIn.checked, (e) => {
        if (e) {
          if (e.detail) {
            this.setState({
              alert: e.detail,
              errorFields: ['username', 'password']
            });
          } else if (e && e.message === 'no_username') {
            this.setState({
              alert: 'No email address provided',
              errorFields: ['username']
            });
          } else if (e && e.message === 'no_password') {
            this.setState({
              alert: 'No password provided',
              errorFields: ['password']
            });
          } else if (['err_invalid_user', 'invalid_credentials'].includes(e.message)) {
            this.setState({
              alert: 'Invalid email or password',
              errorFields: ['username', 'password']
            });
          } else {
            this.setState({
              alert: 'Unknown error'
            });
          }
        }

        // user is successfully logged in
        this.props.refreshApp();
      });
    };
  }

  render() {
    let alert;
    if (this.state.alert) {
      alert = (
        <ul className="alert alert-grey" role="alert">
          <li>{this.state.alert}</li>
        </ul>
      );
    }

    let panel;
    if (this.state.panel === 'intro') {
      panel = (
        <div>
          <div className="top-box">
            <h1>Explore your trips and driving data<span className="mobile-title"> on the web</span>.</h1>
            <div className="login-block">
              <Link to="/demo" className="btn btn-blue btn-block">Try the demo</Link>
              <p>
                Have an Automatic app account?
                &nbsp;<a href="#" className="login-link" onClick={this.toggleLoginPanel}>Log In</a>
              </p>
            </div>
            <div className="mobile-block">
              <p>
                The Automatic dashboard is designed for use in desktop web browsers.
                For the best experience on your phone, use our Android or iPhone app.
              </p>
            </div>
          </div>

          <div className="middle-box">
            <h2>Automatic upgrades your car to a connected car.</h2>
            <div className="graphic-link"></div>
            <ul className="feature-list">
              <li className="save-big">Save money on gas &amp; repairs</li>
              <li className="check-engine-light">Diagnose your engine light</li>
              <li className="map">Never forget where you parked</li>
              <li className="crash-alert">Get help in a serious crash</li>
            </ul>
          </div>
          <div className="bottom-box">
            <a href="http://www.automatic.com" className="btn btn-grey learnMore">Learn more</a>
          </div>
        </div>
      );
    } else {
      panel = (
        <div className="login-form">
          <h1>Log in</h1>
          <p>Use your Automatic app account</p>
          <a href="#" className="back" onClick={this.toggleLoginPanel}>Back</a>
          <form role="form" onSubmit={this.login}>
            <div className={classNames('form-group', { 'has-error': _.contains(this.state.errorFields, 'username') })}>
              <input
                type="text"
                className="form-control"
                ref="username"
                placeholder="Email Address"
                spellCheck="false"
              />
            </div>
            <div className={classNames('form-group', { 'has-error': _.contains(this.state.errorFields, 'password') })}>
              <input type="password" className="form-control" ref="password" placeholder="Password" />
            </div>
            {alert}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  defaultChecked="true"
                  ref="staySignedIn"
                  className="stay-signed-in"
                /> Keep me signed in
              </label>
            </div>
            <button type="submit" className="btn btn-blue btn-block">Login</button>
          </form>
          <div className="forgot-password">
            <p>Forgot your password? <a href="https://accounts.automatic.com/resetpasswordrequest">Reset it</a></p>
            <a href="mailto:support@automatic.com">Need help?</a>
          </div>
        </div>
      );
    }

    return (
      <div>
        <img src="/_assets/images/blurrydash@2x.jpg" className="blurry-dash" />
        <div className="login">
          {panel}
        </div>
      </div>
    );
  }
}
Login.propTypes = {
  refreshApp: React.PropTypes.func.isRequired
};

module.exports = Login;
