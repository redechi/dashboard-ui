define([
  'backbone',
  'hbs!tmpl/item/user_view_tmpl',
  '../../models/user'
],
function( Backbone, UserViewTmpl,user  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a UserView ItemView");

      this.model.fetch();
      this.render();
    },

    template: UserViewTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {},

    model: user
  });
});
