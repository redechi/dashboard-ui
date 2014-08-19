define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
    'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({

    initialize: function() {
      this.on('change', function() {
        coms.trigger('filter:toURL');
      });
    },

    defaults: {},

    /*
     *
     * returns a boolean value: denotes if this filter applies
     * to the supplied model.
     *
     */
    applyTo: function (model) {
      var filtered = this
        .get('func')
        .call(this, model);

      return filtered;
    },

  });
});
