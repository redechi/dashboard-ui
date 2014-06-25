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
          hashObj = {},
          hash = document.location.hash,
          regex = new RegExp('('+name+'=[^&]+)');
      hashObj[name] = this.filterToString();
      document.location.hash = hash.replace(regex, $.param(hashObj));
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
