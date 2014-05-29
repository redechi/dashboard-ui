define([
  'backbone',
  '../collection/trips',
  'hbs!tmpl/item/filters_tmpl'
],
function( Backbone, trips, FiltersTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Filters ItemView");
    },

    collection: trips,

    model: new Backbone.Model({}),

    template: FiltersTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
