define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/header_tmpl',
  '../../models/user'
],
function( Backbone, coms, HeaderTmpl, user ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Header ItemView");

      if(this.attributes.loggedIn) {
        this.model.fetch();
        this.render();
      }

      coms.on('user:change', _.bind(this.render, this));
    },

    template: HeaderTmpl,

    className: 'loggedInHeader',

    ui: {},

    events: {},

    model: user
  });
});
