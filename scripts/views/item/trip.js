define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/trip_tmpl',
  '../../controllers/analytics'
],
function( Backbone, coms, TripTmpl, analytics ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    tagName: 'li',
    template: TripTmpl,


    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'change .tripSelect': 'toggleSelect',
      'click': 'tripLink'
    },


    triggerHighlight: function () {
      coms.trigger('trips:highlight', [this.model]);
    },


    removeHighlight: function () {
      coms.trigger('trips:unhighlight', [this.model]);
    },


    toggleSelect: function () {
      coms.trigger('trips:toggleSelect', [this.model]);
      //because mouse must be on top of this element, keep it highlighted
      coms.trigger('trips:highlight', [this.model]);

      analytics.trackEvent('trip', 'Select');
    },


    tripLink: function (e) {
      //allow click on tripSelect checkbox
      if(!$(e.target).is('.tripSelect')) {
        e.stopPropagation();
        coms.trigger('trips:showSingleTrip', this.model);
      }
    },


    onRender: function() {
      this.$el
        .attr({ 'data-id': this.model.get('id') })
        .toggleClass('selected', !!this.model.get('selected'));
    }
  });

});
