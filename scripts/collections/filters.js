define([
  'backbone',
  'models/filter',
  '../controllers/filter'
],
function( Backbone, FilterModel, filterList) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      //Show date range filter by default
      this.add(new FilterModel(filterList['date']));
    }

  });

  // make this a singleton
  return new Filter();
});
