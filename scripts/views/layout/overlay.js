define([
  'backbone',
  'hbs!tmpl/layout/overlay_tmpl'
],
function( Backbone, OverlayTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize an Overlay Layout");
    },


    template: OverlayTmpl,


    onShow: function (options) {
      var type = this.options.type;
      $('.' + type).show();
    }
  });

});
