define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
    'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function() {
      console.log("initialize a Filter model");
    },

    defaults: {},

    applyTo: function (model) {
      var name = this.get('name');
      var filtered = this.get('func').call(this, model);

      if(name === 'date') {
        coms.trigger('filters:updateDateFilter');
      }

      return filtered;
    },

  });
});
