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

    updateHash: function () {
      var hash = document.location.hash;
      var name = this.get('name');
      var regex = new RegExp('('+name+'=)[^&]+');

      if (regex.test(hash)) {
        // update hash
        hash = hash.replace(regex, '$1' + this.filterToString());
      } else {
        // add hash
        hash += '&'+name+'='+this.filterToString();
      }

      document.location.hash = hash;
    },

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
