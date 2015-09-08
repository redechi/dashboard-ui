/* globals ga */

define([
  'backbone'
],
function( Backbone ) {
  'use strict';

  try {
    // Require google analytics here to handle error if it is blocked by browser
    require(['ga'], function() {
      if(typeof ga === 'undefined') {
        ga = _.noop;
      }

      ga('create', 'UA-33317148-1', 'auto');
      ga('require', 'displayfeatures');
      ga('send', 'pageview');
    });
  } catch(e) { }

  return {
    trackPageview: function(urlFragment) {
      try {
        ga('send', 'pageview', urlFragment);
      } catch(e) { }
    },

    trackEvent: function(category, action, label) {
      try {
        ga('send', 'event', category, action, label);
      } catch(e) { }
    },


    identifyUser: function(email, firstName, lastName) {
      try {
        Raven.setUser({
          email: email
        });
      } catch(e) { }
    }
  };
});
