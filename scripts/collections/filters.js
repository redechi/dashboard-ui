define([
  'backbone',
  'communicator',
  'models/filter',
  'controllers/filter'
],
function( Backbone, coms, FilterModel, filterList ) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.Collection.extend({

    model: Filter,

    initialize: function() {
      console.log('initialize a Filters collection');

      this.applyInitialFilters();

      this.on('add', this.toUrl, this);
      this.on('remove', this.toUrl, this);

      coms.on('filter:toURL', _.bind(this.toUrl, this));
    },


    applyInitialFilters: function() {
      this.add([
        new FilterModel(filterList.vehicle),
        new FilterModel(filterList.date)
      ]);
    },


    getFiltersFromUrl: function() {
      var search = Backbone.history.fragment.replace('filter/?', ''),
          filterObj = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
                 function(key, value) {
                   return key === "" ? value : decodeURIComponent(value);
                 }) : {};

      return filterObj;
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
    }

  });

  // make this a singleton
  return new Filter();
});
