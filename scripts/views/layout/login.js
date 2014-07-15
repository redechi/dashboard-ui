define([
  'backbone',
  'hbs!tmpl/layout/login_tmpl',
  '../../controllers/login'
],
function( Backbone, LoginTmpl, login) {
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
            password: password,
            scope: 'scope:trip:summary scope:location scope:mil:off scope:ignition:on scope:ignition:off scope:mil:on scope:notification:speeding scope:region:changed scope:notification:hard_brake scope:user:details scope:notification:hard_accel scope:vehicle'
          },
          function(data) {
            if(data && data.access_token) {
              $('#loginForm .alert').addClass('hide');
              login.setCookie('token', data.access_token, 60*60*24*7);
              sessionStorage.setItem('accessToken', data.access_token);
              Backbone.history.navigate('#/');
            }
          }).fail(function(jqXHR, textStatus, errorThrown) {
            //TODO: better error messages
            $('#loginForm .alert')
              .text('Error: ' + textStatus)
              .removeClass('hide');
          });
      }

      return false;
    },

    onRender: function () {}
  });

});
