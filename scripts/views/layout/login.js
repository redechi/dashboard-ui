define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/login_tmpl',
  '../../controllers/login',
  '../../controllers/analytics'
],
function( Backbone, coms, regionManager, LoginTmpl, login, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: LoginTmpl,


    events: {
      'submit #loginForm form': 'login',
      'focus #loginForm input': 'clearError',
      'click .forgotPasswordLink': 'forgotPassword',
      'click .toggleLoginForm': 'toggleLoginForm',
      'click .learnMore': 'learnMore',
      'click .tryDemo': 'tryDemo'
    },


    initialize: function() {
      coms.on('login:error', this.errorAlert, this);
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


    errorAlert: function(message, emailError, passwordError) {
      $('.alert', this.$el)
        .html(message)
        .removeClass('invisible');

      $('#email', this.$el).parent('.form-group').toggleClass('has-error', !!emailError);
      $('#password', this.$el).parent('.form-group').toggleClass('has-error', !!passwordError);
    },


    clearError: function(e) {
      $(e.target).parent('.form-group').removeClass('has-error');
    },


    clearErrors: function() {
      $('.alert', this.$el).addClass('invisible');
      $('form-group', this.$el).removeClass('has-error');
    },


    login: function () {
      var email = $('#email', this.$el).val(),
          password = $('#password', this.$el).val(),
          staySignedIn = $('.staySignedIn', this.$el).is(':checked');

      if(!email || !password) {
        this.errorAlert('Please enter an email and a password', !email, !password);
      } else {
        this.errorAlert('Logging in&hellip;');

        login.login(email, password, staySignedIn);
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
