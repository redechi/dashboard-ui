define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/login_tmpl',
  '../../controllers/login'
],
function( Backbone, regionManager, LoginTmpl, login ) {
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


    errorAlert: function(message, emailError, passwordError) {
      $('.alert', this.$el)
        .html(message)
        .removeClass('invisible');

      $('#email', this.$el).parent('.form-group').toggleClass('has-error', emailError);
      $('#password', this.$el).parent('.form-group').toggleClass('has-error', passwordError);
    },


    clearError: function() {
      $('.alert', this.$el).addClass('invisible');
      $('form-group', this.$el).removeClass('has-error');
    },


    login: function (e) {
      var self = this,
          email = $('#email', e.target).val(),
          password = $('#password', e.target).val();

      if(!email || !password) {
        this.errorAlert('Please enter an email and a password', (!email), (!password));
      } else {
        this.clearError();

        $.post(
          login.getAuthorizeUrl() + '/oauth/access_token',
          {
            client_id: '385be37e93925c8fa7c7',
            grant_type: 'password',
            username: email,
            password: password,
            scope: 'scope:trip:summary scope:location scope:mil:off scope:ignition:on scope:ignition:off scope:mil:on scope:notification:speeding scope:region:changed scope:notification:hard_brake scope:user:details scope:notification:hard_accel scope:vehicle'
          },
          function(data) {
            if(data && data.access_token) {
              $('#loginForm .alert').addClass('invisible');
              login.setCookie('token', data.access_token, 60*60*24*7);
              sessionStorage.setItem('accessToken', data.access_token);
              Backbone.history.navigate('#/');
            }
          }
        ).fail(function(jqXHR, textStatus, error) {
          if(jqXHR.status === 401) {
            self.errorAlert('Invalid email or password', true, true);
          } else {
            self.errorAlert('Unknown error', false, false);
          }
        });
      }

      return false;
    },


    onRender: function () {
      regionManager.getRegion('main_header').reset();
    }
  });

});
