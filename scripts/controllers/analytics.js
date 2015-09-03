define([
  'backbone'
],
function( Backbone ) {
  'use strict';

  // Assign google anlaytics to noop initially, in case it is blocked by browser
  var ga = _.noop;

  try {
    // Require google analytics here to handle error if it is blocked by browser
    require(['ga'], function() {
      ga('create', 'UA-33317148-1');
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
