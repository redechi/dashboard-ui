define([
  'backbone',
  './settings'
],
function( Backbone, settings ) {
  'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function() {
      window.logintest = this;
    },


    defaults: {
      client_id: settings.get('client_id'),
      grant_type: 'password',
      scope: 'scope:trip scope:location scope:vehicle:profile scope:vehicle:events scope:user:profile scope:automatic scope:behavior',
      staySignedIn: true
    },


    url: function () {
      return settings.get('base_host') + '/oauth/access_token/';
    },


    validate: function() {
      if(!this.get('username')) {
        return 'Please enter your email';
      }

      if(!this.get('password')) {
        return 'Please enter your password';
      }
    }

  });
});
