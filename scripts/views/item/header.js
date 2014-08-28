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


    events: {
      'click .login': 'login',
      'click .whatIsAutomatic': 'whatIsAutomatic'
    },


    className: function() {
      return (login.isDemo()) ? 'demo' : 'loggedIn';
    },


    login: function() {
      ga('send', 'event', 'button', 'click', 'login');
    },


    whatIsAutomatic: function() {
      ga('send', 'event', 'button', 'click', 'whatIsAutomatic');
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
