define([
  'backbone',
  'communicator',
  './settings'
],
function( Backbone, coms, settings ) {
    'use strict';

  return Backbone.Model.extend({

    url: function() {
      return settings.get('newton_host') + '/internal/licenseplus/';
    }
  });
});
