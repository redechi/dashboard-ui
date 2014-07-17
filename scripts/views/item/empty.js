define([
  'backbone',
  'hbs!tmpl/item/empty_tmpl'
],
function( Backbone, EmptyTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Empty ItemView");
    },

    template: EmptyTmpl,

    onRender: function() {}
  });
});
