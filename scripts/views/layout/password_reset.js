define([
  'backbone',
  'hbs!tmpl/layout/password_reset_tmpl',
  '../../controllers/login',
  '../../models/settings',
  '../../controllers/analytics'
],
function( Backbone, PasswordResetTmpl, login, settings, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: PasswordResetTmpl,


    events: {
      'submit #passwordResetRequestForm': 'resetPasswordRequest',
      'focus #passwordResetRequestForm input': 'clearError',
      'submit #passwordResetForm': 'resetPassword',
      'focus #passwordResetForm input': 'clearError',
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
          settings.get('base_host') + '/password/reset_email/',
          {email: email},
          function(data) {
            if(data && data.success) {
              self.successAlert('We\'ve sent further instructions to ' + email);
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


    onRender: function() {
      analytics.trackEvent('reset password request', 'Show');
    }
  });
});
