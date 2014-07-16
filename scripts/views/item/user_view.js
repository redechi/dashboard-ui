define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/user_view_tmpl',
  '../../models/user'
],
function( Backbone, coms, UserViewTmpl, user ) {
    'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a UserView ItemView");

      if(this.attributes.loggedIn) {
        this.model.fetch();
        this.render();
      }

      coms.on('user:change', _.bind(this.render, this));
    },

    template: UserViewTmpl,

    ui: {},

    events: {},

    onRender: function() {},

    model: user
  });
});
