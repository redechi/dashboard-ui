define([
  'backbone',
  'models/filter'
],
function( Backbone, Filter) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter

  });

  // make this a singleton
  return new Filter();
});
