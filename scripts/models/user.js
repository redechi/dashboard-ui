define([
  'backbone',
  'communicator',
  '../controllers/login',
  './settings'
],
function( Backbone, coms, login, settings ) {
    'use strict';

  var User = Backbone.Model.extend({
    initialize: function() {
      this.on('change', function() {
        coms.trigger('user:change');
      });
    },

    url: settings.get('api_host') + '/v1/user'
  });

  return new User();
});
