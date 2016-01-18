import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';

const formatters = require('../js/formatters');
const graph = require('../js/graph');

const ListItem = require('./list_item.jsx');

const graphTypes = [
  {
    key: 'mpg',
    name: 'MPG',
    unit: 'MPG'
  },
  {
    key: 'cost',
    name: 'Cost',
    unit: 'FUEL'
  },
  {
    key: 'score',
    name: 'Score',
    unit: '/100'
  },
  {
    key: 'distance',
    name: 'Distance',
    unit: 'MILES'
  },
  {
    key: 'duration',
    name: 'Duration',
    unit: 'MIN'
  }
];

class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphType: 'mpg'
    };

    this.setGraphType = (graphType) => {
      this.refs.graphTypePopover.hide();
      this.setState({ graphType });
    };
  }

  componentDidMount() {
    this.updateGraph();
  }

  componentDidUpdate() {
    this.updateGraph();
  }

  getGraphWidth() {
    const minWidth = 614;
    const horizontalPadding = 425;
    return Math.max(this.props.windowWidth - horizontalPadding, minWidth);
  }

    getGraphDateRange() {
      const dateRangeComponents = this.props.filters.date.split(',');
      const dateRange = [parseInt(dateRangeComponents[0], 10), parseInt(dateRangeComponents[1], 10)];
      const firstTrip = _.last(this.props.trips);
      if (dateRangeComponents[2] === 'allTime' && firstTrip) {
        dateRange[0] = moment(firstTrip.started_at).startOf('day');
      }

      return dateRange;
    }

  updateGraph() {
    graph.updateGraph(this.props.trips, this.state.graphType, this.getGraphWidth(), this.getGraphDateRange());
  }

  render() {
    const graphTypePopover = (
      <Popover id="graphType" title="Choose Metric" className="popover-graph-type">
        <ul className="list-select">
          {graphTypes.map(graphType =>
            <ListItem onItemClick={this.setGraphType} key={graphType.key} item={graphType} />
          )}
        </ul>
      </Popover>
    );

    const selectedGraphType = _.find(graphTypes, (item) => item.key === this.state.graphType);

    return (
      <div className="graph">
        <div className="graph-menu">
          <div className="date-range">{formatters.dateRange(this.getGraphDateRange())}</div>
          <div className="graph-type-label">Graph</div>
          <OverlayTrigger placement="bottom" trigger="click" ref="graphTypePopover" overlay={graphTypePopover}>
            <div className="graph-type" data-toggle="popover">
              {selectedGraphType.name} <i className="fa fa-angle-down fa-lg"></i>
            </div>
          </OverlayTrigger>
        </div>

        <div className="graph-averages">
          <div className="graph-averages-label">Your average</div>
          <div className="graph-averages-value" id="graphAverage"></div>
          <div className="graph-averages-unit">{selectedGraphType.unit}</div>
          <div className="graph-averages-background">{selectedGraphType.unit}</div>
        </div>

        <div className="graph-container">
          <div className="graph-tooltip" id="graphTooltip"></div>
        </div>
      </div>
    );
  }
}
Graph.propTypes = {
  filters: React.PropTypes.object,
  trips: React.PropTypes.array,
  windowWidth: React.PropTypes.number
};

module.exports = Graph;
