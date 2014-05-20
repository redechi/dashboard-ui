define([
  'backbone',
  'hbs!tmpl/item/trip_tmpl'
],
function( Backbone, TripTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
    },

    /* on render callback */
    onRender: function () {},

    template: TripTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

  });

});
