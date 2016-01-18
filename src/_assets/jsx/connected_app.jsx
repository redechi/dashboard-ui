import React from 'react';

const alert = require('../js/alert');
const confirm = require('../js/confirm');
const requests = require('../js/requests');

class ConnectedApp extends React.Component {
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
ConnectedApp.propTypes = {
  app: React.PropTypes.object,
  disconnectApp: React.PropTypes.func
};

module.exports = ConnectedApp;
