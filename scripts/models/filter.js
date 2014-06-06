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

    applyTo: function (collection) {
      var name = this.get('name');
      var filtered = collection.filter(this.get('func'), this);
      var fc = collection.reset(filtered);

      if(name == 'date') {
        coms.trigger('filters:updateDateFilter');
      }

      return fc;
    },

  });
});
