import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'underscore';

const graph = require('../js/graph');

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

module.exports = class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphType: 'mpg'
    };

    this.setGraphType = (graphType) => {
      this.refs.graphTypePopover.hide();
      this.setState({graphType: graphType});
    };
  }

  calculateAverage() {
    let total = this.props.totals[this.state.graphType];

     //TODO: divide total by bins except for score and mpg
     return total;
  }

  getGraphWidth() {
    return this.props.windowWidth - 410;
  }

  render() {
    let graphTypePopover = (
      <Popover id="graphType" title="Choose Metric" className="popover-graph-type">
        <ul className="list-select">
          {graphTypes.map((graphType) => {
            return (
              <li onClick={this.setGraphType.bind(null, graphType.key)} key={graphType.key}>
                {graphType.name}
              </li>
            )
          })}
        </ul>
      </Popover>
    )

    let selectedGraphType = _.find(graphTypes, (item) => item.key === this.state.graphType);

    return (
      <div className="graph">
        <div className="graph-menu">
          <div className="date-range"></div>
          <div className="graph-type-label">Graph</div>
          <OverlayTrigger placement="bottom" trigger="click" ref="graphTypePopover" overlay={graphTypePopover}>
            <div className="graph-type" data-toggle="popover">
              {selectedGraphType.name} <i className="fa fa-angle-down fa-lg"></i>
            </div>
          </OverlayTrigger>
        </div>

        <div className="graph-averages">
          <div className="graph-averages-label">Your average</div>
          <div className="graph-averages-value">{this.calculateAverage()}</div>
          <div className="graph-averages-unit">{selectedGraphType.unit}</div>
          <div className="graph-averages-background">{selectedGraphType.unit}</div>
        </div>

        <div className="graph-container">
          <div className="graph-tooltip-container"><div className="graph-tooltip"></div></div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    graph.updateGraph(this.props.trips, this.state.graphType, this.getGraphWidth());
  }

  componentDidUpdate() {
    graph.updateGraph(this.props.trips, this.state.graphType, this.getGraphWidth());
  }
};
