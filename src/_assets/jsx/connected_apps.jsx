import React from 'react';
import _ from 'lodash';

const ConnectedApp = require('./connected_app.jsx');

const alert = require('../js/alert');
const login = require('../js/login');
const requests = require('../js/requests');

class ConnectedApps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      apps: []
    };

    this.disconnectApp = (appId) => {
      const apps = _.reject(this.state.apps, app => app.id === appId);
      this.setState({ apps });
    };
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
        apps,
        loading: false
      });
    });
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
        <ConnectedApp app={app} key={key} disconnectApp={this.disconnectApp} />
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
}

module.exports = ConnectedApps;
