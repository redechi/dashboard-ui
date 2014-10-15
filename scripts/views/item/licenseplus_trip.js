define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/trip_tmpl'
],
function( Backbone, coms, TripTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    tagName: 'li',
    template: TripTmpl,


    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'click': 'selectTrip'
    },


    triggerHighlight: function () {
      coms.trigger('trips:highlight', [this.model]);
    },


    removeHighlight: function () {
      coms.trigger('trips:unhighlight', [this.model]);
    },


    selectTrip: function (e) {
      $(e.currentTarget).toggleClass('selected');
    },

  });

});
