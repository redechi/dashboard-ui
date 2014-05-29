define([
  'backbone',
  'hbs!tmpl/item/trips_header_tmpl'
],
function( Backbone, TripsHeaderTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a TripsHeader ItemView");
    },

    template: TripsHeaderTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
