define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/trip_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, TripTmpl, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
    },

    tagName: "li",

    template: TripTmpl,


    templateHelpers: {
      over60Minutes: function() {
        return (this.duration >= 60);
      }
    },


    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'click .tripLink': 'tripLink',
      'click': 'toggleSelect'
    },


    triggerHighlight: function () {
      coms.trigger('trips:highlight', this.model);
    },


    removeHighlight: function () {
      coms.trigger('trips:unhighlight', this.model);
    },


    toggleSelect: function () {
      coms.trigger('trips:toggleSelect', this.model);
    },


    tripLink: function (e) {
      e.stopPropagation();
      coms.trigger('trips:showSingleTrip', this.model);
    },

    onRender: function() {
      this.$el
        .attr({ 'data-id': this.model.get('id') })
        .toggleClass('selected', !!this.model.get('selected'));
    }
  });

});
