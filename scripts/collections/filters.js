define([
  'backbone',
  'communicator',
  'models/filter',
  'controllers/filter',
  'deparam'
],
function( Backbone, coms, FilterModel, filterList, deparam ) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.Collection.extend({

    model: Filter,

    initialize: function() {
      this.applyInitialFilters();

      this.on('add', this.toUrl, this);
      this.on('add', this.applyFilter, this);
      this.on('remove', this.toUrl, this);

      coms.on('filter:toURL', this.toUrl, this);
    },


    applyInitialFilters: function() {
      this.add([
        new FilterModel(filterList.vehicle),
        new FilterModel(filterList.date)
      ]);
    },


    getFiltersFromUrl: function() {
      var queryStart = Backbone.history.fragment.indexOf('?');
      var query = Backbone.history.fragment.substring(queryStart + 1);
      return deparam(query);
    },


    formatFiltersToURL: function() {
      var filterObj = _.object(this.map(function (filter) {
        return [filter.get('name'), filter.get('toURL').call(filter)];
      }));
      return '/filter/?' + $.param(filterObj);
    },


    toUrl: function() {
      Backbone.history.navigate(this.formatFiltersToURL());
    },


    fromUrl: function (string) {
      var filterObj = this.getFiltersFromUrl(),
          self = this;

      this.reset();

      _.each(filterObj, function (value, name) {
        if (!filterList.hasOwnProperty(name)) { return; }

        var filter = new FilterModel(filterList[name]);
        filter.get('fromURL').call(filter, value);

        self.add(filter);
      });

      // if fewer than two models, clear and create a vehicle and date filter.
      if (_.size(filterObj) < 2) {
        this.applyInitialFilters();
      }
    },

    saveFilters: function() {
      var fragment = Backbone.history.fragment;
      //don't write initial or duplicate states to history
      if(fragment !== Backbone.history.previous[0] && fragment != '' && fragment != 'filter/?vehicle=all') {
        Backbone.history.previous.push(fragment);
      }
      //erase next history
      Backbone.history.next = [];
    },

    applyFilter: function(filter) {
      // if filter has applyOnAdd = true, apply it right on add
      if(filter.get('applyOnAdd')) {
        coms.trigger('filter:applyAllFilters');
      }
    }

  });

  // make this a singleton
  return new Filter();
});
