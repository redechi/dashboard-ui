define([
  'backbone',
  'communicator',
  '../controllers/filter',
  '../models/settings'
],
function( Backbone, coms, filterList, settings ) {
  'use strict';

  /* vehicles singleton */
  var Vehicles = Backbone.Collection.extend({

    model: Backbone.Model.extend({}),
    url: settings.get('api_host') + '/vehicle/',
    comparator: 'display_name',


    fetchDemoVehicles: function() {
      var self = this;
      $.getJSON('./assets/data/vehicles.json', function(vehicles) {
        self.set(vehicles);
        coms.trigger('filter:updateVehicleList');
      });
    },

    parse: function(response) {
      return response.results;
    },

    fetchInitial: function () {
      if(settings.isDemo()) {
        //get trips from local JSON
        this.fetchDemoVehicles();
      } else {
        return this.fetch({
          error: settings.requestErrorHandler
        }).always(function() {
          coms.trigger('filter:updateVehicleList');
        });
      }
    },

    getVehicle: function(url) {
      return this.findWhere({url: url});
    }

  });

  // make this a singleton
  return new Vehicles();
});
