import React from 'react';
import { Link } from 'react-router';

module.exports = class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panel: 'intro'
    };

    this.toggleLoginPanel = (e) => {
      e.preventDefault();

      this.setState({
        panel: this.state.panel === 'intro' ? 'login' : 'intro'
      });
    };
  }

  render() {
    let panel;
    if (this.state.panel === 'intro') {
      panel = (
        <div>
          <div className="top-box">
            <h1>Explore your trips and driving data<span className="mobile-title"> on the web</span>.</h1>
            <div className="login-block">
              <Link to="demo" className="btn btn-blue btn-block">Try the demo</Link>
              <p>Have an Automatic app account?  <a href="#" className="login-link" onClick={this.toggleLoginPanel}>Log In</a></p>
            </div>
            <div className="mobile-block">
              <p>Currently, our dashboard is designed for use in desktop web browsers.  For the best experience on your phone, use our Android or iPhone app.</p>
              <a href="com.automatic://" className="btn btn-blue btn-ios-link">Open the Automatic app</a>
              <a href="automatic://goto?id=insights_screen" className="btn btn-blue btn-android-link">Open the Automatic app</a>
              <a href="http://automatic.com" className="btn btn-blue btn-learn-more">Learn more about Automatic</a>
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
          <form role="form">
            <div className="form-group">
              <input type="text" className="form-control" name="username" placeholder="Email Address" spellcheck="false" />
            </div>
            <div className="form-group">
              <input type="password" className="form-control" name="password" placeholder="Password" />
            </div>
            <ul className="alert alert-grey invisible" role="alert"></ul>
            <div className="form-group">
              <label><input type="checkbox" checked name="staySignedIn" className="stay-signed-in" /> Keep me signed in</label>
            </div>
            <button type="submit" className="btn btn-blue btn-block">Login</button>
          </form>
          <div className="forgot-password">
            <p>Forgot your password? <a href="#reset">Reset it</a></p>
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
};
