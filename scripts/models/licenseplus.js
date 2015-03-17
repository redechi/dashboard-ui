define([
  'backbone',
  'communicator',
  './settings'
],
function( Backbone, coms, settings ) {
    'use strict';

  return Backbone.Model.extend({

    url: function() {
      return settings.get('api_host') + '/internal/licenseplus/';
    }
  });
});
