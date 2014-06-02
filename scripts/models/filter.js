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
      var filtered = collection.filter(this.get('func'), this);
      var fc = collection.reset(filtered);
      return fc;
    },

  });
});
