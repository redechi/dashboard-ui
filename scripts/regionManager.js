define([
  'backbone',
  'communicator'
],
function( Backbone, Communicator ) {
  'use strict';

  var RegionManager = Backbone.Marionette.Controller.extend({

    initialize: function( options ) {
      /* internal region manager */
      this._regionManager = new Backbone.Marionette.RegionManager();

      /* event API */
      Communicator.trigger('RM:addRegion', this.addRegion, this);
      Communicator.trigger('RM:removeRegion', this.removeRegion, this);
      Communicator.trigger('RM:getRegion', this.getRegion, this);
    },

    /* add region facade */
    addRegion: function( regionName, regionId ) {
      var region = this.getRegion( regionName );

      if( region ) {
        return region;
      }

      return this._regionManager.addRegion( regionName, regionId );
    },

    /* remove region facade */
    removeRegion: function( regionName ) {
      this._regionManager.removeRegion( regionName );
    },

    /* get region facade */
    getRegion: function( regionName ) {
      return this._regionManager.get( regionName );
    }
  });

  return new RegionManager();
});
