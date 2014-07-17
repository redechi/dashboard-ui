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
      'submit #passwordResetForm': 'resetPassword'
    },


    resetPassword: function (e) {
      var password = $('#password', e.target).val(),
          passwordRepeat = $('#passwordRepeat', e.target).val(),
          match = (password === passwordRepeat && password);


      if(match) {
        $('#password, #passwordRepeat', e.target)
          .parent('.form-group')
          .removeClass('has-error');

        $('#passwordResetForm .alert').addClass('hide');

        //TODO: post to password reset URL
      } else {
        $('#password, #passwordRepeat', e.target)
          .parent('.form-group')
          .addClass('has-error');

        $('#passwordResetForm .alert')
          .text('Error: Passwords do not match')
          .removeClass('hide');
      }

      return false;
    },


    onRender: function () {}
  });
});
