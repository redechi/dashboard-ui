define([
  'backbone',
  'hbs!tmpl/layout/login_tmpl'
],
function( Backbone, LoginTmpl) {
    'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a Login Layout");
    },

    template: LoginTmpl,

    ui: {},

    events: {
      'submit #loginForm': 'login'
    },

    login: function (e) {
      var email = $('#email', e.target).val(),
          password = $('#password', e.target).val();

      $('#email', e.target).parent('.form-group').toggleClass('has-error', (!email));
      $('#password', e.target).parent('.form-group').toggleClass('has-error', (!password));

      if(email && password) {
        $.post(
          'https://www.automatic.com/oauth/access_token',
          {
            client_id: '385be37e93925c8fa7c7',
            grant_type: 'password',
            username: email,
            password: password
          },
          function(data) {
            console.log(data)
          });
      }

      return false;
    },

    onRender: function () {}
  });

});
