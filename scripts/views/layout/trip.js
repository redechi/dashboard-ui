define([
  'backbone',
  '../item/map_single',
  'hbs!tmpl/layout/trip_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, MapSingleView, TripTmpl, formatters ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a Trip Layout");
    },


    template: TripTmpl,

    regions: {
      map: '#map'
    },


    templateHelpers: function() {
      var trip = this.collection.models[0],
          helpers = {};

      if(trip) {
        helpers =  {
          title: formatters.formatTime(trip.get('start_time'), trip.get('start_time_zone'), 'MMM DD, YYYY h:mm A - ') + formatters.formatTime(trip.get('end_time'), trip.get('end_time_zone'), 'h:mm A'),
          distance: formatters.distance(trip.get('distance_miles')),
          duration: formatters.durationHours(trip.get('duration')),
          score: formatters.score(trip.get('score')),
          cost: formatters.cost(trip.get('fuel_cost_usd')),
          mpg: formatters.averageMPG(trip.get('distance_miles') / trip.get('fuel_volume_gal')),
          nextTrip: trip.get('nextTrip'),
          prevTrip: trip.get('prevTrip')
        };
      }

      return helpers;
    },


    onRender: function() {
      var m = new MapSingleView({collection: this.collection});
      this.map.show(m);
    }
  });
});
