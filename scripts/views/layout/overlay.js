define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/overlay_tmpl'
],
function( Backbone, regionManager, OverlayTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log('initialize an Overlay Layout');
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
