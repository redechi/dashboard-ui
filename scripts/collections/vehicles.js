define([
  'backbone',
  'communicator',
  'models/vehicle',
  '../controllers/filter',
  '../controllers/login'
],
function( Backbone, coms, Vehicle, filterList, login ) {
  'use strict';

  /* vehicles singleton */
  var Vehicles = Backbone.Collection.extend({
    model: Vehicle,


    url: login.getAPIUrl() + '/v1/vehicles',


    comparator: 'display_name',


    fetchDemoVehicles: function() {
      var self = this;
      $.getJSON('./assets/data/vehicles.json', function(vehicles) {
        self.set(vehicles);
        coms.trigger('filter:updateVehicleList');
      });
    },


    fetchInitial: function () {
      if(login.isDemo()) {
        //get trips from local JSON
        this.fetchDemoVehicles();
      } else {
        return this.fetch({
          error: login.fetchErrorHandler
        }).always(function() {
          coms.trigger('filter:updateVehicleList');
        });
      }
    }

  });

  // make this a singleton
  return new Vehicles();
});
