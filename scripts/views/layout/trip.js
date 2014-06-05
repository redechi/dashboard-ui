define([
  'backbone',
  'hbs!tmpl/layout/trip_tmpl'
],
function( Backbone, TripTmpl  ) {
    'use strict';

  /* Return a Layout class definition */
  return Backbone.Marionette.Layout.extend({

    initialize: function() {
      console.log("initialize a Trip Layout");
    },
    
    el: '#content',

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
      
    }
  });

});
