define([
  'backbone',
  'models/trip',
  'amlCollection'
],
function( Backbone, Trip, filterStrat) {
  'use strict';

  return {
    orient: function(arg){
      this.chart = this.chart.orient(arg);
      return this;
    },
    ranges: function(arg){
      this.chart = this.chart.ranges(arg);
      return this;
    },
    markers: function(arg){
      this.chart = this.chart.markers(arg);
      return this;
    },
    measures: function(arg){
      this.chart = this.chart.measures(arg);
      return this;
    },
    forceX: function(arg){
      this.chart = this.chart.forceX(arg);
      return this;
    }
  };

});
