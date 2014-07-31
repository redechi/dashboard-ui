define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/overlay_tmpl'
],
function( Backbone, coms, regionManager, OverlayTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log('initialize an Overlay Layout');
      coms.on('overlay:hide', _.bind(this.closeOverlay, this));
    },


    template: OverlayTmpl,


    className: function() {
      return this.options.type;
    },


    events: {
      'click a.close': 'closeOverlay'
    },


    closeOverlay: function () {
      regionManager.getRegion('main_overlay').reset();
    }
  });

});
