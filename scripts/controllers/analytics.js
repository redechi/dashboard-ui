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
    }
  };
});
