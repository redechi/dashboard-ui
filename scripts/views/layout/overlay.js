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
      coms.on('overlay:hide', _.bind(this.closeOverlay, this));
      coms.on('overlay:page', _.bind(this.updateLoadingOverlayCount, this));
    },


    template: OverlayTmpl,


    className: function() {
      return this.options.type;
    },


    events: {
      'click a.btn-close': 'closeOverlay'
    },


    closeOverlay: function () {
      regionManager.getRegion('main_overlay').reset();
    },


    updateLoadingOverlayCount: function(count) {
      $('.loadingProgress').text(count + ' trips loaded');
    }
  });

});
