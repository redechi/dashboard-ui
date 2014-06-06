define([
  'backbone',
  '../item/map_single',
  'hbs!tmpl/layout/trip_tmpl',
	'../item/user_view',
  '../../controllers/unit_formatters'
],
function( Backbone, MapSingleView, TripTmpl, UserView, formatters ) {
    'use strict';

    console.log( Backbone );
    console.log( MapSingleView );


  /* Return a Layout class definition */
  return Backbone.Marionette.Layout.extend({

    initialize: function() {
      console.log("initialize a Trip Layout");
    },

    template: TripTmpl,

    /* Layout sub regions */
    regions: {
      map: '#map',
			user: '#user'
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    templateHelpers: function() {
      var trip = this.collection.models[0],
          helpers = {};
      console.log(trip)

      if(trip) {
        helpers =  {
          title: formatters.formatTime(trip.get('start_time'), trip.get('start_time_zone'), 'MMM DD, YYYY h:mm A - ') + formatters.formatTime(trip.get('end_time'), trip.get('end_time_zone'), 'h:mm A'),
          distance: formatters.distance(trip.get('distance_m')),
          duration: formatters.duration(trip.get('duration')),
          score: formatters.score(trip.get('score')),
          cost: formatters.cost(trip.get('fuel_cost_usd')),
          mpg: formatters.averageMPG(formatters.m_to_mi(trip.get('distance_m')) / trip.get('fuel_volume_gal')),
          nextTrip: trip.get('nextTrip'),
          prevTrip: trip.get('prevTrip')
        };
      }

      return helpers;
    },

    /* on render callback */
    onRender: function() {
      var m = new MapSingleView({collection: this.collection});
			var u = new UserView();

      this.map.show(m);
			this.user.show(u);
    }
  });

});
