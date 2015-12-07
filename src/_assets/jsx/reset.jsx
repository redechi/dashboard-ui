import React from 'react';
import classNames from 'classnames';
import _ from 'underscore';

const login = require('../js/login');


module.exports = class Reset extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorFields: []
    };

    this.handleResetSubmit = (event) => {
      event.preventDefault();

      if(!this.refs.username.value) {
        this.setState({
          alert: 'Please enter an email address',
          errorFields: ['username']
        });
      } else {
        this.setState({
          alert: undefined,
          errorFields: []
        });
        login.reset(this.refs.username.value, (e) => {
          console.log(e);
          if(e) {
            this.setState({
              alert: e.message,
              errorFields: ['username']
            });
          } else {
            this.setState({
              alert: `We've sent further instructions to ${this.refs.username.value}`
            });
          }
        });
      }
    };
  }
  render() {
    let alert;

    if(this.state.alert) {
      alert = (
        <div className="alert alert-grey">{this.state.alert}</div>
      );
    }

    return (
      <form onSubmit={this.handleResetSubmit} className="reset">
        <h1>Forgot your password?</h1>
        <p>If you can’t remember your password, you can reset it by entering your email address.</p>
        <div className={classNames('form-group', {'has-error': _.contains(this.state.errorFields, 'username')})}>
          <input type="email" className="form-control" ref="username" placeholder="Email Address" spellCheck="false" />
        </div>
        {alert}
        <button type="submit" className="btn btn-blue btn-block">Request Password Reset</button>
      </form>
    );
  }
};
