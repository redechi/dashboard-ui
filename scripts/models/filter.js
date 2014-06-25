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
      var hashString = this.toHash();
      var hash = document.location.hash;
      var name = this.get('name');
      var regex = new RegExp('('+name+'=[^&]+)');
      document.location.hash = hash.replace(regex, hashString);
    },

    /*
     *
     * converts to hash query parameter
     *
     */
    toHash: function () {
      var name = this.get('name');
      var valueString = this.filterToString();
      return name + '=' + encodeURIComponent(valueString);
    },

    /*
     *
     * converts values to string.
     *
     */
    filterToString: function () {
      var filterName = this.get('name');

      if(filterName === 'vehicle') {
        return this.get('value');
      } else if(filterName === 'location') {
        return [this.get('latlng'), this.get('type'), this.get('valueText')].join(',');
      } else {
        return this.get('value').join(',');
      }

    },

    /*
     *
     * returns a boolean value: denotes weather this filter applys
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
