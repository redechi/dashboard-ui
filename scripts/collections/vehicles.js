define([
  'backbone',
  'models/vehicle',
  '../controllers/filter',
  '../controllers/login'
],
function( Backbone, Vehicle, filterList, login ) {
  'use strict';

  /* vehicles singleton */
  var Vehicles = Backbone.Collection.extend({
    model: Vehicle,
    url: login.getAPIUrl() + '/v1/vehicles',
    comparator: 'display_name'

  });

  // make this a singleton
  return new Vehicles();
});
