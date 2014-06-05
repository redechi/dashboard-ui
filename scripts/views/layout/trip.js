define([
  'backbone',
  '../item/map', 
  'hbs!tmpl/layout/trip_tmpl'
],
function( Backbone, MapView, TripTmpl ) {
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
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {
      var m = new MapView();
      console.log(this.map);
      this.map.show(m);
    }
  });

});
