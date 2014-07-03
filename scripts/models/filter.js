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
      this.on('change', function() {
        coms.trigger('filter:change');
      });
    },

    defaults: {},

    updateHash: function () {
      var name = this.get('name'),
          regex = new RegExp('('+name+'=[^&]+)'),
          filterObj = _.object([[name, this.filterToString()]]);
      var newUrl = Backbone.history.fragment.replace(regex, $.param(filterObj));
      Backbone.history.navigate(newUrl);
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
