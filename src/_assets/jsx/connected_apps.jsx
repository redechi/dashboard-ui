import React from 'react';
import _ from 'lodash';

const login = require('../js/login');
const requests = require('../js/requests');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.disconnectApp = () => {
      if (confirm(`Are you sure you want to disconnect ${this.props.app.name}?`)) {
        requests.disconnectApp(this.props.app.id, (e) => {
          if (e) {
            return alert('Unable to disconnect app. Please try again later.');
          }

          this.props.disconnectApp(this.props.app.id);
        });
      }
    };
  }

  render() {
    return (
      <li>
        <div className="app-icon">
          <img src={this.props.app.icon || '/_assets/images/default-app-image.png'} />
        </div>
        <h3 className="app-title">{this.props.app.name}</h3>
        <div className="app-controls">
          <a href={this.props.app.app_url} target="_blank" className="btn btn-block btn-blue">View App</a>
          <button className="btn btn-block btn-grey" onClick={this.disconnectApp}>Disconnect App</button>
        </div>
      </li>
    );
  }
}

module.exports = class ConnectedApps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      apps: []
    };

    this.disconnectApp = (appId) => {
      let apps = _.reject(this.state.apps, app => app.id === appId);
      this.setState({apps: apps});
    };
  }

  render() {
    let appList;
    if (this.state.loading) {
      appList = (
        <div className="loading">Loading...</div>
      );
    } else if (!this.state.apps.length) {
      appList = (
        <div className="no-apps">
          You have not connected any apps yet.
        </div>
      );
    } else {
      appList = this.state.apps.map((app, key) => (
        <App app={app} key={key} disconnectApp={this.disconnectApp} />
      ));
    }

    return (
      <div className="main">
        <div className="connected-apps">
          <h1 className="page-title">Connected Apps</h1>
          <ul className="app-list">
            {appList}
          </ul>
          <div className="more-apps">
            Want more apps? Visit the <a href="https://www.automatic.com/apps/">Automatic App Gallery</a>.
          </div>
        </div>
      </div>
    );
  }

  componentWillMount() {
    if (!login.isLoggedIn()) {
      window.location = '/';
    }
  }

  componentDidMount() {
    requests.getApps((e, apps) => {
      if (e) {
        return alert('Unable to fetch data. Please try again later.');
      }

      this.setState({
        apps: apps,
        loading: false
      });
    });
  }
};
