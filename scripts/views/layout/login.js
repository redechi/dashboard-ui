define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/login_tmpl',
  '../../models/login',
  '../../models/settings',
  '../../controllers/login',
  '../../controllers/analytics'
],
function( Backbone, coms, regionManager, LoginTmpl, LoginModel, settings, login, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: LoginTmpl,


    events: {
      'submit #loginForm form': 'login',
      'focus #loginForm input': 'clearError',
      'click .forgotPasswordLink': 'forgotPassword',
      'click .toggleLoginForm': 'toggleLoginForm',
      'click .learnMore': 'learnMore',
      'click .tryDemo': 'tryDemo',
      'change input[name="username"]': 'dataBindInput',
      'change input[name="password"]': 'dataBindInput',
      'change input[name="staySignedIn"]': 'dataBindInput'
    },

    model: new LoginModel({type: 'login'}),


    initialize: function() {
      this.model.on('invalid', this.loginError, this);
      coms.on('login:error', this.loginError, this);

      if(settings.isStaging() && !settings.isUsingStaging()) {
        if(!window.confirm('Would you like to use the Production database (OK) or Staging database (Cancel)?')) {
          window.location.search = 'staging';
        }
      }
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

    toggleLoginForm: function(e) {
      e.preventDefault();

      $('#loginDemo', this.$el).toggle(!$('#loginDemo', this.$el).is(':visible'));
      $('#loginForm', this.$el).toggle(!$('#loginForm', this.$el).is(':visible'));
    },


    learnMore: function() {
      analytics.trackEvent('learn more', 'Click');
    },


    tryDemo: function() {
      analytics.trackEvent('try demo', 'Click');
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

    /*
     *
     * Accepts model or string for validation errors;
     *
     */
    loginError: function(obj) {
      var message = obj;
      if (typeof message !== 'string') message = obj.validate();
      this.clearErrors();
      this.errorAlert(message, $('#loginForm .form-group', this.$el));
    },


    login: function (e) {
      e.preventDefault();

      $('input[name="username"]', this.$el).trigger('change');
      $('input[name="password"]', this.$el).trigger('change');
      $('input[name="staySignedIn"]', this.$el).trigger('change');

      var isValid = login.login(this.model)
      if (isValid) {
        this.clearErrors();
        this.errorAlert('Logging in&hellip;');
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
