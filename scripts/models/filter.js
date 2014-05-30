define([
  'backbone',
  'communicator',
  '../controllers/filter'
],
function( Backbone, coms, strategies ) {
    'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function() {
      console.log("initialize a Filter model");
    },

    defaults: {},

    filterStrategies: strategies, // override me

    applyTo: function (collection) {
      // TODO: applys its self to a supplied collection
      var funcName = this.get('func');
      var args = this.get('args');

      var func = this.filterStrategies[funcName];
      var percolator = func.call(this, args);
      var filtered = collection.filter(percolator);
      var fc = collection.reset(filtered);
      return fc;
    },

  });
});
