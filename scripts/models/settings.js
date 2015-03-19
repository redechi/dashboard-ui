
/*
 *
 * @type Singleton
 * @class settings
 *
 * This detects weather you are on staging or production and applies the
 * correct environment based on your query string flags.
 *
 * EX :: settings.get("api_host";)
 *
 */

define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
  'use strict';


  var stagingData = {
    api_host: 'https://automatic-api-staging.herokuapp.com',
    newton_host: 'https://api.automatic.co',
    base_host: 'https://accounts.automatic.co'
  };


  function isDemo () {
    return window.location.search.indexOf('demo') !== -1;
  }


  function isStaging () {
    return window.location.hostname === 'dashboard.automatic.co';
  }


  function isUsingStaging () {
    return window.location.search.indexOf('staging') !== -1;
  }



  /* Return a model class definition */
  var Settings = Backbone.Model.extend({

    isDemo: isDemo,
    isStaging: isStaging,
    isUsingStaging: isUsingStaging,


    defaults: {
      client_id: '385be37e93925c8fa7c7',
      newton_host: 'https://api.automatic.com',
      base_host: 'https://accounts.automatic.com',
      api_host: 'https://api.automatic.com'
    },


    requestErrorHandler: function(model, result) {
      if(result.status === 403) {
        coms.trigger('error:403');
      } else if (result.status >= 500 && result.status < 600) {
        coms.trigger('error:500');
      } else {
        coms.trigger('error:500');
      }
    }
  });


  var opt = isUsingStaging() ? stagingData : {};
  return new Settings(opt);
});
