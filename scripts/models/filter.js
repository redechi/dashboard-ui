define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
    'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({

    initialize: function() {
      console.log('initialize a Filter model');
      this.on('change', this.updateHash, this);
    },

    defaults: {},

    updateHash: function () {
      var name = this.get('name'),
          regex = new RegExp('('+name+'=[^&]+)'),
          filterObj = _.object([[name, this.get('toURL').call(this)]]);
      var newUrl = Backbone.history.fragment.replace(regex, $.param(filterObj));
      Backbone.history.navigate(newUrl);
    },

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
