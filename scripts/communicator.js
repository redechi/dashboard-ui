define([
  'backbone',
  'backbone.marionette'
],
function( Backbone ) {
    'use strict';

  var Communicator = Backbone.Marionette.Controller.extend({
    initialize: function( options ) {
      _.extend(this, Backbone.Events);
    }
  });

  // singleton
  return new Communicator();
});
