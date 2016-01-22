import React from 'react';

import classNames from 'classnames';

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this._onClick = () => {
      this.props.onItemClick(this.props.value);
    };
  }

  render() {
    return (
      <li onClick={this._onClick} className={classNames({ selected: this.props.selected })}>
        {this.props.name}
      </li>
    );
  }
}
ListItem.propTypes = {
  onItemClick: React.PropTypes.func.isRequired,
  name: React.PropTypes.string,
  value: React.PropTypes.string,
  selected: React.PropTypes.bool
};

module.exports = ListItem;
