import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'underscore';
import classNames from 'classnames';

const filters = require('../js/filters.js');

const Filter = require('./filter.jsx');

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      undoCount: 0
    };

    this.updateFilter = (filterName, filterValue) => {
      this.props.updateFilter(filterName, filterValue);
      this.refs.filterTypePopover.hide();
      this.setState({undoCount: this.state.undoCount + 1});
    };

    this.undoFilter = () => {
      if(this.state.undoCount > 0) {
        this.setState({undoCount: this.state.undoCount - 1});
        this.props.undoFilter();
      }
    }
  }

  render() {
    let filterTypePopover = (
      <Popover id="filterType" title="Add Filter" className="popover-filter-type">
        <ul className="list-select animate">
          {filters.getRemainingFilters(this.props.filters).map((filterType) => {
            return (
              <li onClick={this.updateFilter.bind(null, filterType.key, filters.getFilter(filterType.key).defaultValue)} key={filterType.key}>
                {filterType.name}
              </li>
            )
          })}
        </ul>
      </Popover>
    )

    let appliedFilters = _.map(this.props.filters, (value, key) => {
      return <Filter
        key={key}
        value={value}
        vehicles={this.props.vehicles}
        filterType={key}
        updateFilter={this.updateFilter} />
    });

    let addFilterControl;

    if(filters.getRemainingFilters(this.props.filters).length) {
      addFilterControl = (
        <li>
          <div className="filter-label">and</div>
          <OverlayTrigger placement="bottom" trigger="click" ref="filterTypePopover" overlay={filterTypePopover}>
            <div title="Add Filter" className="add-filter btn btn-filter btn-popover">+</div>
          </OverlayTrigger>
        </li>
      )
    }

    return (
      <div className="filters">
        <ul className="filter-controls">
          <label>Filters:</label>
          <li
            className={classNames('undo', 'btn', 'btn-filter', {disabled: this.state.undoCount < 1})}
            onClick={this.undoFilter}>
            Undo
          </li>
          <li
            className="reset btn btn-filter"
            onClick={this.props.resetFilters}>
            Reset
          </li>
        </ul>

        <ul className="applied-filters">
          {appliedFilters}
          {addFilterControl}
        </ul>
      </div>
    );
  }
};
