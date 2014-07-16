define([
  'backbone',
  'models/vehicle',
  '../controllers/filter'
],
function( Backbone, Vehicle, filterList ) {
  'use strict';

  /* vehicles singleton */
  var Vehicles = Backbone.AML.Collection.extend({

    model: Vehicle,
    url: 'https://api.automatic.com/v1/vehicles',
    comparator: 'display_name',

    initialize: function() {
      console.log('initialize a Vehicles collection');
    }

  });

  // make this a singleton
  return new Vehicles();
});
