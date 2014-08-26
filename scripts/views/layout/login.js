define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/login_tmpl',
  '../../controllers/login'
],
function( Backbone, regionManager, LoginTmpl, login ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: LoginTmpl,


    events: {
      'submit #loginForm': 'login',
      'focus #loginForm input': 'clearError',
      'click .forgotPasswordLink': 'forgotPassword'
    },


    errorAlert: function(message, emailError, passwordError) {
      $('.alert', this.$el)
        .html(message)
        .removeClass('invisible');

      $('#email', this.$el).parent('.form-group').toggleClass('has-error', emailError);
      $('#password', this.$el).parent('.form-group').toggleClass('has-error', passwordError);
    },


    clearError: function(e) {
      $(e.target).parent('.form-group').removeClass('has-error');
    },


    clearErrors: function() {
      $('.alert', this.$el).addClass('invisible');
      $('form-group', this.$el).removeClass('has-error');
    },


    login: function () {
      var self = this,
          email = $('#email', this.$el).val(),
          password = $('#password', this.$el).val(),
          staySignedIn = $('.staySignedIn').is(':checked'),
          expires = (staySignedIn) ? 60*60*24*7 : null;

      if(!email || !password) {
        this.errorAlert('Please enter an email and a password', (!email), (!password));
      } else {
        this.clearErrors();
        this.errorAlert('Logging in&hellip;', false, false);

        $.post(
          login.getBaseUrl() + '/oauth/access_token',
          {
            client_id: '385be37e93925c8fa7c7',
            grant_type: 'password',
            username: email,
            password: password,
            scope: 'scope:trip:summary scope:location scope:mil:off scope:ignition:on scope:ignition:off scope:mil:on scope:notification:speeding scope:region:changed scope:notification:hard_brake scope:user:details scope:notification:hard_accel scope:vehicle scope:admin'
          },
          function(data) {
            if(data && data.access_token) {
              $('#loginForm .alert').addClass('invisible');
              login.setCookie('token', data.access_token, expires);
              sessionStorage.setItem('accessToken', data.access_token);
              Backbone.history.navigate('#/');
            }
          }
        ).fail(function(jqXHR, textStatus, error) {
          console.error(jqXHR);
          if(jqXHR.status === 401) {
            self.errorAlert('Invalid email or password', true, true);
          } else {
            self.errorAlert('Unknown error', false, false);
          }
        });
      }

      return false;
    },


    forgotPassword: function (e) {
      var email = $('#email', this.$el).val();
      if(email) {
        $(e.target).attr('href', '#reset?email=' + encodeURIComponent(email));
      }
    },


    onRender: function () {
      regionManager.getRegion('main_header').reset();
    },


    onShow: function () {
      if(login.isStaging() && !login.isUsingStaging()) {
        if(!window.confirm('Would you like to use the Production database (OK) or Staging database (Cancel)?')) {
          window.location.search = 'staging';
        }
      }
    }
  });

});
