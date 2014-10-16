define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/single_badge_tmpl'
],
function( Backbone, coms, SingleBadgeTmpl) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: SingleBadgeTmpl,


    className: function() {
      var className = 'singleBadgeOverlay';
      if(this.model.get('completed')) {
        className += ' ' + this.model.get('slug');
      }
      return className;
    },


    events: {
      'click .close': 'hideBadgeOverlay'
    },


    hideBadgeOverlay: function() {
      coms.trigger('licenseplus:hideBadgeOverlay');
    }
  });
});
