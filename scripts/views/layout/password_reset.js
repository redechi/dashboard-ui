define([
  'backbone',
  'hbs!tmpl/layout/password_reset_tmpl',
  '../../controllers/login'
],
function( Backbone, PasswordResetTmpl, login ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log('initialize a Password Reset Layout');
    },


    template: PasswordResetTmpl,


    events: {
      'submit #passwordResetRequestForm': 'resetPasswordRequest',
      'submit #passwordResetForm': 'resetPassword'
    },


    errorAlert: function(message, emailError, passwordError) {
      $('.alert', this.$el)
        .html(message)
        .removeClass('invisible');

      $('#email', this.$el).parent('.form-group').toggleClass('has-error', emailError);
      $('#password', this.$el).parent('.form-group').toggleClass('has-error', passwordError);
      $('#passwordRepeat', this.$el).parent('.form-group').toggleClass('has-error', passwordError);
    },


    successAlert: function(message) {
      $('.alert', this.$el)
        .html(message)
        .removeClass('invisible');
    },


    clearError: function(e) {
      $(e.target).parent('.form-group').removeClass('has-error');
    },


    clearErrors: function() {
      $('.alert', this.$el).addClass('invisible');
      $('form-group', this.$el).removeClass('has-error');
    },


    resetPasswordRequest: function (e) {
      var self = this,
          email = $('#email', e.target).val();

      if(!email) {
        this.errorAlert('Please enter an email address', true, false);
      } else {
        this.clearErrors();

        $.post(
          login.getBaseUrl() + '/password/reset_email/', { email: email },
          function(data) {
            if(data && data.success) {
              self.successAlert('Heads up!  We sent a password reset email to ' + email);
            } else {
              self.errorAlert('Invalid Email Address', true, false);
            }
          }
        ).fail(function(jqXHR, textStatus, error) {
          self.errorAlert('Unknown error', false, false);
        });
      }

      return false;
    },


    resetPassword: function (e) {
      var password = $('#password', e.target).val(),
          passwordRepeat = $('#passwordRepeat', e.target).val(),
          match = (password === passwordRepeat && password);


      if(match) {
        $('#password, #passwordRepeat', e.target)
          .parent('.form-group')
          .removeClass('has-error');

        $('.alert', e.target).addClass('hide');


      } else {
        $('#password, #passwordRepeat', e.target)
          .parent('.form-group')
          .addClass('has-error');

        $('.alert', e.target)
          .html('<strong>Error:</strong> Passwords do not match')
          .removeClass('alert-success')
          .addClass('alert-danger')
          .removeClass('hide');
      }

      return false;
    },


    onShow: function() {
      if(Backbone.history.fragment !== 'reset') {
        var email = Backbone.history.fragment.replace('reset?email=', '');
        $('#email', this.$el).val(decodeURIComponent(email));
      }
    }
  });
});
