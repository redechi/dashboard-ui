define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/coach_login_tmpl',
  '../../models/login',
  '../../controllers/login',
  '../../controllers/analytics'
],
function( Backbone, coms, regionManager, CoachLoginTmpl, LoginModel, login, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: CoachLoginTmpl,

    model: new LoginModel({type: 'coach'}),

    events: {
      'submit #loginForm form': 'login',
      'submit #createAccountForm form': 'createAccount',
      'focus form input': 'clearError',
      'click .forgotPasswordLink': 'forgotPassword',
      'click .toggleLoginForm': 'toggleLoginForm',
      'click .learnMore': 'learnMore',

      'change input[name="username"]': 'dataBindInput',
      'change input[name="password"]': 'dataBindInput',
      'change input[name="last_name"]': 'dataBindInput',
      'change input[name="first_name"]': 'dataBindInput',
      'change input[name="staySignedIn"]': 'dataBindInput',
      'change input[name="password_repeat"]': 'dataBindInput'
    },


    dataBindInput: function (e) {
      var value = '',
          name = $(e.target).attr('name');

      if ($(e.target).attr('type') === 'checkbox') {
        value = $(e.target).is(':checked');
      } else {
        value = $(e.target).val();
      }

      this.model.set(name, value);
    },


    initialize: function(opts) {
      this.model.set('token', opts.token);
      this.model.on('invalid', this.loginError, this);
      coms.on('login:error', this.loginError, this);
      if(login.isLoggedIn) {
        login.logout();
      }
    },


    toggleLoginForm: function(e) {
      e.preventDefault();
      this.clearErrors();

      $('#loginForm', this.$el).toggle(!$('#loginForm', this.$el).is(':visible'));
      $('#createAccountForm', this.$el).toggle(!$('#createAccountForm', this.$el).is(':visible'));
    },


    learnMore: function() {
      analytics.trackEvent('learn more', 'Click');
    },


    errorAlert: function(message, formGroup) {
      $('.alert', this.$el)
        .append($('<li>').html(message))
        .removeClass('invisible');

      $(formGroup).addClass('has-error');
    },


    clearError: function(e) {
      $(e.target).parent('.form-group').removeClass('has-error');
    },


    clearErrors: function() {
      $('.alert', this.$el)
        .empty()
        .addClass('invisible');

      $('form-group', this.$el).removeClass('has-error');
    },


    loginError: function(obj) {
      var message = obj;
      if (typeof message !== 'string') message = obj.validate();
      this.clearErrors();
      this.errorAlert(message, $('#loginForm .form-group', this.$el));
    },


    login: function (e) {
      this.model.set('type', 'coach');

      e.preventDefault();

      $('#loginForm input', this.$el).each(function() {
        $(this).trigger('change');
      });

      var isValid = login.login(this.model);
      if (isValid) {
        this.clearErrors();
        this.errorAlert('Logging in&hellip;');
      }
    },


    createAccount: function (e) {
      this.model.set('type', 'create_coach');

      $('#createAccountForm input', this.$el).each(function() {
        $(this).trigger('change');
      });

      e.preventDefault();
      var isValid = login.createAccount(this.model);
      if (isValid) {
        this.clearErrors();
        this.errorAlert('Creating Account&hellip;');
      }
    },


    forgotPassword: function (e) {
      var email = $('#loginForm input[name="email"]', this.$el).val();
      if(email) {
        $(e.target).attr('href', '#reset?email=' + encodeURIComponent(email));
      }
    },


    onRender: function () {
      regionManager.getRegion('main_header').reset();
    },
  });

});
