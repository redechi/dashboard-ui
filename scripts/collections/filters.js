define([
  'backbone',
  'communicator',
  'models/filter',
  '../controllers/filter'
],
function( Backbone, coms, FilterModel, filterList) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      //Show date range filter by default
      this.on('add', this.toUrl, this);
      this.on('remove', this.toUrl, this);
      // this.add(new FilterModel(filterList.date));
      window.filters = this
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

      filterStrings = filterStrings.filter(function(n){ return !!n});

      // split on =
      filterStrings = _.map(filterStrings, function (fs) {
        return fs.split('=');
      }, this);

      return filterStrings;
    },

    toUrl: function (filterModel) {
      filterModel.updateHash();
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
    }



  });

  // make this a singleton
  return new Filter();
});
