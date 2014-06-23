define([
  'backbone',
  'communicator',
  'models/filter',
  'amlCollection',
  '../controllers/filter'
],
function( Backbone, coms, FilterModel, amlCollection, filterList) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      //Show date range filter by default
      this.on('add', this.toUrl, this);
      this.on('remove', this.toUrl, this);
      // this.add(new FilterModel(filterList.date));
      window.filters = this;

      // add all filters in filter controller
      for (var i in filterList) {
        var name = i.charAt(0).toUpperCase() + i.substring(1);
        this['add'+name+'Filter'] = function () {
          this.setNewFilter(new FilterModel(filterList[i]));
        };
      }
    },

    /*
     *
     * safely adds new filter prefferably from add<filter name>Filter
     * EX: this.addDateFilter()
     *
     */
    setNewFilter: function (filterModel) {
      var dateFilter = this.findWhere({name: filterModel.name});
      if (!dateFilter) {
        this.push(filterModel);
      } else {
        dateFilter.set(intermFilter.toJSON());
      }
    },

    parseHash: function () {
      var hash = decodeURIComponent(document.location.hash);
      var filterStrings = hash.substring(1)

        // chromes decodeURIComponent is broken, decode the important things
        // if they are still present
        .split('%3A').join(':').split('%2C').join(',')

        .split('?')
        .pop()
        .split('&');

      filterStrings = filterStrings.filter(function(n){ return !!n; });

      // split on =
      filterStrings = _.map(filterStrings, function (fs) {
        return fs.split('=');
      }, this);

      return filterStrings;
    },

    /*
     *
     * handles deduplication and hash generation.
     *
     */
    toUrl: function () {
      var hashString = '#/filter/?';
      var dedupeStrings = {};
      this.each(function (filterModel) {
        var name = filterModel.get('name');
        dedupeStrings[name] = filterModel.toHash();
      });
      var filterStrings = _.values(dedupeStrings);
      var hash = hashString + filterStrings.join('&');
      document.location.hash = hash;
    },

    fromUrl: function (string) {
      var modelData = {};
      var filterStrings = this.parseHash();

      // ensure all models share the same data.
      filterStrings.map(function (filterKeyValue) {
        var obj = {};
        var name = filterKeyValue.shift();
        var argsString = filterKeyValue.shift();
        var argsArray = argsString.split(',');
        modelData[name] = argsArray;
      });

      // make models if query parameter exists.
      for (var filterName in modelData) {
        if (!filterList.hasOwnProperty(filterName)) return
        var preExistingModel = this.findWhere({name: filterName});

        if (!!preExistingModel) {
          preExistingModel.set({value: modelData[filterName]});
        } else {
          var filter = new FilterModel(filterList[filterName])
          filter.set({value: modelData[filterName]});
          this.add(filter);
        }
      }

      // remove any extra models
      this.each(_.bind(function (filter) {
        var name = filter.get('name');
        if (!modelData.hasOwnProperty(name)) {
          this.remove(filter);
        }
      }, this));

      // if no model data than create a date filter.
      if (!Object.keys(modelData)[0]) {
        var filter = new FilterModel(filterList.date);
        this.add(filter);
      }
    }



  });

  // make this a singleton
  return new Filter();
});
