define([
  'backbone',
  'hbs!tmpl/layout/password_reset_tmpl'
],
function( Backbone, PasswordResetTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a Password Reset Layout");
    },


    template: PasswordResetTmpl,


    events: {
      'submit #passwordResetRequestForm': 'resetPasswordRequest',
      'submit #passwordResetForm': 'resetPassword'
    },


    resetPasswordRequest: function (e) {
      var email = $('#email', e.target).val();

      if(!email) {
        $('#email', e.target)
          .parent('.form-group')
          .addClass('has-error');

        $('.alert', e.target)
          .html('<strong>Error:</strong> Please enter an email address')
          .removeClass('alert-success')
          .addClass('alert-danger')
          .removeClass('hide');
      } else {
        //TODO: post to password reset request URL
        $('#email', e.target)
          .parent('.form-group')
          .removeClass('has-error');

        $('.alert', e.target)
          .html('<strong>Heads up!</strong> We sent a password reset email to ' + email + '.')
          .removeClass('alert-danger')
          .addClass('alert-success')
          .removeClass('hide');
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

        //TODO: post to password reset URL
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
    }
  });
});
