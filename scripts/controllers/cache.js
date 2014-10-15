define([
  'moment'
],
function( moment ) {
  'use strict';

  return {
    save: function(key, json) {
      sessionStorage.setItem(key, JSON.stringify(json));
      //expire after 15 minutes
      sessionStorage.setItem(key + '_expires', moment().add(15, 'minutes').valueOf());
    },

    fetch: function(key) {
      var expires = sessionStorage.getItem(key + '_expires');

      if(expires > moment().valueOf()) {
        return JSON.parse(sessionStorage.getItem(key));
      } else {
        return;
      }
    }

  };

});
