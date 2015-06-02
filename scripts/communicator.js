/*
 *
 * @type singleton
 * @class communicator
 *
 * This is the communication bus.
 * Its used for communicating between Views, Models and Collections.
 *
 * you should only need the following methods
 * .on :: listens for all occurrences of an event
 * .once :: listens for the firs occurence of an event
 * .trigger :: fires an event on the bus
 *
 * The standard event key structure is separaed by colons.
 * <object name>:<object event name>:<optional sub event name>
 */

define([
  'backbone',
  'backbone.marionette'
],
function(Backbone) {
    'use strict';

  var Communicator = Backbone.Marionette.Controller.extend({
    initialize: function() {
      _.extend(this, Backbone.Events);

      // keep this around for logging coms
      // uncomment when all traffic should be viewed.
      //
      // this.on('all', _.bind(this.logit, this));
    },

    logit: function () {console.log(arguments);}
  });

  return new Communicator();
});
