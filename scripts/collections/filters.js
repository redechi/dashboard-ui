define([
  'underscore',
  'backbone',
  'communicator',
  'models/filter',
  'controllers/filter',
  './vehicles'
],
function( _, Backbone, coms, FilterModel, filterList, vehiclesCollection) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      console.log('initialize a Filters collection');

      this.on('add', this.toUrl, this);
      this.on('remove', this.toUrl, this);

      window.filters = this;
    },


    getFiltersFromUrl: function () {
      var search = Backbone.history.fragment.replace('filter/?', ''),
          filterObj = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
                 function(key, value) {
                   return key === "" ? value : decodeURIComponent(value);
                 }) : {};

      return filterObj;
    },

    /*
     *
     * handles deduplication and hash generation.
     *
     */
    toUrl: function () {
      console.log('Write Filters to URL');
      var filterObj = _.object(this.map(function (filter) {
        return [filter.get('name'), filter.get('toURL').call(filter)];
      }));
      Backbone.history.navigate('/filter/?' + $.param(filterObj));
    },

    fromUrl: function (string) {
      console.log('Parsing Filters from URL');
      var filterObj = this.getFiltersFromUrl(),
          self = this;

      _.each(filterObj, function (value, name) {
        if (!filterList.hasOwnProperty(name)) {
          return;
        }

        var filter = self.findWhere({name: name}) || new FilterModel(filterList[name]);
        filter.get('fromURL').call(filter, value);

        self.add(filter);
      });

      // remove any extra models
      this.each(_.bind(function (filter) {
        var name = filter.get('name');
        if (!filterObj.hasOwnProperty(name)) {
          this.remove(filter);
        }
      }, this));

      // if fewer than two models, clear and create a vehicle and date filter.
      if (_.size(filterObj) < 2) {
        this.reset();
        this.add(new FilterModel(filterList.vehicle));
        this.add(new FilterModel(filterList.date));
      }
    }

  });

  // make this a singleton
  return new Filter();
});
