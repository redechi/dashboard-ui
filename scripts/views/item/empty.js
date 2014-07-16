define([
  'backbone',
  'hbs!tmpl/item/empty_tmpl'
],
function( Backbone, EmptyTmpl ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Empty ItemView");
    },

    template: EmptyTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
