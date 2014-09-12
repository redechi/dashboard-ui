define([
  'backbone'
],
function( Backbone ) {
  'use strict';

  return {
    trackPageview: function(urlFragment) {
      if(typeof ga !== 'undefined') {
        ga('send', 'pageview', urlFragment);
      }
    },


    trackEvent: function(category, action, label) {
      if(typeof ga !== 'undefined') {
        ga('send', 'event', category, action, label);
      }
      if(typeof mixpanel !== 'undefined') {
        mixpanel.track(action + ' ' + category, {
          label: label
        });
      }
    },


    identifyUser: function(email, firstName, lastName) {
      if(typeof mixpanel !== 'undefined') {
        mixpanel.identify(email);
        mixpanel.people.set({
          $last_login: new Date(),
          $email: email
        });
        mixpanel.register({
          'App': 'Dashboard'
        });
      }
    }
  };
});
