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
      return (login.isPlayground()) ? 'playground' : 'loggedIn';
    },

    onShow: function() {
      //Get Satisfaction feedback link
      if (typeof GSFN !== 'undefined') {
        GSFN.loadWidget(7348, {containerId: 'getsat-widget-7348'});
      }
    },

    model: user
  });
});
