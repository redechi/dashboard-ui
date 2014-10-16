define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
  'use strict';


  var stagingData = {
    client_id: '0720f83e74f19181e49d',
    api_host: 'https://api.automatic.co',
    newton_host: 'https://automatic-newton-stage.herokuapp.com',
    base_host: 'https://staging.automatic.co'
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
      newton_host: 'https://automatic-newton.herokuapp.com',
      base_host: 'https://www.automatic.com',
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
