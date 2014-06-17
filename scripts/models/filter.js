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
      coms.trigger('filters:newFilter', this);
      this.on('change', this.updateHash, this);
    },

    defaults: {},

    /*
     *
     * converts to hash query parameter
     *
     */
    toHash: function () {
      var hash = document.location.hash;
      var name = this.get('name');
      var regex = new RegExp('('+name+'=)[^&]+');
      var valueString = this.filterToString();

      return name + '=' + valueString;
    },

    /*
     *
     * converts values to string.
     *
     */
    filterToString: function () {
      var values = this.get('value').join(',');
      return encodeURIComponent(values);
    },

    /*
     *
     * returns a boolean value: denotes weather this filter applys
     * to the supplied model.
     *
     */
    applyTo: function (model) {
      var name = this.get('name');
      var filtered = this
        .get('func')
        .call(this, model);

      return filtered;
    },

  });
});
