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
      scope: 'scope:trip scope:location scope:vehicle:profile scope:vehicle:events scope:user:profile scope:automatic',
      staySignedIn: true
    },


    url: function () {
      var host = '',
          path = '';

      if (this.get('type') === 'create_coach' ) {
        host = settings.get('newton_host');
        path = '/user/';
      } else {
        host = settings.get('base_host');
        path = '/oauth/access_token/';
      }

      return host + path;
    },


    validate: function (attrs, options) {
      var self = this;

      if(!self.get('username')) {
        return 'Please enter your email';
      }

      if(!self.get('password')) {
        return 'Please enter your password';
      }


      // exit here if login form
      if(self.get('type') !== 'create_coach') {
        return;
      }


      if(!self.get('first_name')) {
        return 'Please enter your first name';
      }

      if(!self.get('last_name')) {
        return 'Please enter your last name';
      }

      if(!self.get('password_repeat')) {
        return 'Please enter repeat your password';
      }

      if(self.get('password') !== self.get('password_repeat')) {
        return 'Passwords do not match';
      }

      if(self.get('password') && self.get('password').length < 8) {
        return 'Your password must be at least 8 characters';
      }
    }

  });
});
