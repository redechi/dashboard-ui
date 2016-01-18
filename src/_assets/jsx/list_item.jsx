import React from 'react';

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this._onClick = () => {
      this.props.onItemClick(this.props.item.key);
    };
  }

  render() {
    return (
      <li onClick={this._onClick}>
        {this.props.item.name}
      </li>
    );
  }
}
ListItem.propTypes = {
  onItemClick: React.PropTypes.func.isRequired,
  item: React.PropTypes.object
};

module.exports = ListItem;
