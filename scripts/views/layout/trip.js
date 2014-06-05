define([
  'backbone',
  '../item/map',
  'hbs!tmpl/layout/trip_tmpl',
	'../item/user_view'
],
function( Backbone, MapView, TripTmpl, UserView ) {
    'use strict';

    console.log( Backbone );
    console.log( MapView );
    window.MapView = MapView;

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

    /* on render callback */
    onRender: function() {
      var m = new MapView();
			var u = new UserView();

      this.map.show(m);
			this.user.show(u);
    }
  });

});
