define([
  'backbone',
  '../models/settings'
],
function( Backbone, settings ) {
  'use strict';

  /* apps singleton */
  var Apps = Backbone.Collection.extend({

    model: Backbone.Model.extend({}),

    baseUrl: function() {
      if(settings.isUsingStaging) {
        return 'https://api.automatic.co/v1';
      } else {
        return 'https://api.automatic.com/v1';
      }
    },

    url: function() {
      return this.baseUrl() + '/access_token';
    },

    fetchInitial: function () {
      var self = this;

      return this.fetch({
        error: settings.requestErrorHandler
      }).always(function() {
        self.trigger('reset');
      });
    }
  });

  // make this a singleton
  return new Apps();
});
