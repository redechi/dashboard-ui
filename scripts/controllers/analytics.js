define('mixpanel-preinit', function() {
  // this is a stripped down version of the mixpanel snippet that removes the loading of the lib via external script tag and the stubs for queuing calls
  var b=window.mixpanel=window.mixpanel||[];var i,g;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";b._i.push([a,e,d])};b.__SV=1.2;
  b.init('d326b2d504cef20b730aaa5bd44c8be2');
});


define([
  'backbone'
],
function( Backbone ) {
  'use strict';

  try {
    // Require google analytics here to handle error if it is blocked by browser
    require(['ga'], function() {
      if(typeof ga === 'undefined') {
        window.ga = _.noop;
      }

      ga('create', 'UA-33317148-4');
      ga('require', 'displayfeatures');
      ga('send', 'pageview');
    });
  } catch(e) { }

  try {
    // require mixpanel here to handle error if it is blocked by browser
    require(['mixpanel'], null, function() {
      window.mixpanel = _.noop;
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

      try {
        mixpanel.track(action + ' ' + category, {
          label: label
        });
      } catch(e) { }
    },


    identifyUser: function(email, firstName, lastName) {
      try {
        mixpanel.identify(email);
        mixpanel.people.set({
          $last_login: new Date(),
          $email: email
        });
        mixpanel.register({
          'App': 'Dashboard'
        });

        Raven.setUser({
          email: email
        });
      } catch(e) { }
    }
  };
});
