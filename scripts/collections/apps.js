define([
  'backbone',
  '../models/settings'
],
function(Backbone, settings) {
  'use strict';

  /* apps singleton */
  var Apps = Backbone.Collection.extend({

    model: Backbone.Model.extend({}),

    url: function() {
      return settings.get('api_host') + '/v1/access_token';
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
