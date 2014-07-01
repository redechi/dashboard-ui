define([
  'backbone',
  'communicator'
],
function( Backbone, Communicator) {
  'use strict';

  /* trips singleton */
  var AMLCollection = Backbone.Collection.extend({

    name: 'default_collection',

    getGraphSet: function (name) {
      var set = [];

      this.each(function (model) {
        var val = model.get(name);
        if (val) {
          set.push({y: val, x: model.get('end_time')});
        }
      });

      return set.reverse();
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
      Communicator.trigger('collection:'+this.name+':aggregate', value);
      this.trigger('aggregate', value);
      return value;
    },

    // sets the current aggregation strategy for this collection
    setAgg: function (aggProperty) {
      this.sumator = this.aggStragegies[aggProperty];
      return this;
    }
  });

  Backbone.AML = Backbone.AML || {};
  Backbone.AML.Collection = AMLCollection
  return AMLCollection;
});
