define([
  'backbone',
  'communicator'
],
function( Backbone, Communicator) {
  'use strict';

  /* trips singleton */
  var AMLCollection = Backbone.Collection.extend({

    name: 'default_collection',

    //
    //
    // filter tools
    //
    //

    filterStrategies: {}, // override me

    filter: function (filterName) {
      var filtered = this.filterStrategies[filterName];
      var fc = new this.constructor(filtered);
      Communicator.trigger('trips:filter', fc);
      this.trigger('filter', fc);
      return fc; 
    },

    //
    //
    // sorting tools
    //
    //

    // sorting strategies
    sortStrategies: {}, // override me

    // the default comparitor for sorting
    comparitor: function (model) {
      return function () {};
    },

    // sets the current sort property for this collection
    setSort: function (sortProperty) {
      this.comparator = this.sortStrategies[sortProperty];
      return this;
    },


    //
    //
    // aggregation tools
    //
    //

    // aggregation strategies
    aggStragegies: {}, // override me

    // the default aggregation strategy
    sumator: function (memo, value) {
      return function () {};
    },

    // return the aggregated value.
    aggregate: function () {
      var value = this.reduce(this.sumator);
      this.trigger('aggregate', value);
      return value;
    },

    // sets the current aggregation strategy for this collection
    setAgg: function (aggProperty) {
      this.sumator = this.aggStragegies[aggProperty];
      return this;
    }
  });

  console.log(AMLCollection);

  Backbone.AML = Backbone.AML || {};
  return Backbone.AML.Collection = AMLCollection;
});
