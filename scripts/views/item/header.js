define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/header_tmpl',
  '../../models/user',
  '../../controllers/login'
],
function( Backbone, coms, HeaderTmpl, user, login ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      if (this.attributes.loggedIn) {
        this.model.fetch({error: login.fetchErrorHandler});
        this.render();
      }

      coms.on('user:change', _.bind(this.render, this));
    },

    template: HeaderTmpl,

    className: function() {
      if(login.isPlayground()) {
        return 'playground';
      } else {
        return 'loggedIn';
      }
    },

    model: user
  });
});
