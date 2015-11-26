import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'underscore';

const filters = require('../js/filters.js');

const Filter = require('./filter.jsx');

module.exports = class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.addFilter = (filter) => {
      this.props.updateFilter(filter, filters.getFilter(filter).defaultValue);
      this.refs.filterTypePopover.hide();
    }

    this.removeFilter = (filter) => {
      this.props.updateFilter(filter, null);
      this.refs.filterTypePopover.hide();
    }
  }

  render() {
    let filterTypePopover = (
      <Popover id="filterType" title="Add Filter" className="popover-filter-type">
        <ul className="list-select animate">
          {filters.getRemainingFilters(this.props.filters).map((filterType) => {
            return (
              <li onClick={this.addFilter.bind(null, filterType.key)} key={filterType.key}>
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
        filterType={key}
        removeFilter={this.removeFilter} />
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
          <li className="undo btn btn-filter disabled">Undo</li>
          <li className="reset btn btn-filter">Reset</li>
        </ul>

        <ul className="applied-filters">
          {appliedFilters}
          {addFilterControl}
        </ul>
      </div>
    );
  }
};
