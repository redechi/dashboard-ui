define([
  'moment'
],
function( moment ) {
  'use strict';

  return {
    enabled: true,

    save: function(key, item) {
      if (this.enabled) {
        try {
          var value = (typeof item === 'object') ? JSON.stringify(item) : item;
          sessionStorage.setItem(key, value);
          //expire after 15 minutes
          sessionStorage.setItem(key + '_expires', moment().add(15, 'minutes').valueOf());
        } catch(e) {
          sessionStorage.clear();
          this.enabled = false;
        }
      }
    },

    fetch: function(key, ignoreExpires) {
      if (this.enabled) {
        var expires = sessionStorage.getItem(key + '_expires');

        if (expires > moment().valueOf() || ignoreExpires) {
          try {
            return JSON.parse(sessionStorage.getItem(key));
          } catch(e) {
            return sessionStorage.getItem(key);
          }
        }
      }
    }
  };
});
