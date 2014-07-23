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
    

    templateHelpers: function() {
      return {
        noSpeeding: (this.model.get('duration_over_70_s') === 0),
        noHardBrakes: (this.model.get('hard_brakes') === 0),
        noHardAccels: (this.model.get('hard_accels') === 0)
      };
    },


    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'click': 'toggleSelect'
    },


    triggerHighlight: function () {
      coms.trigger('trips:highlight', this.model);
    },


    removeHighlight: function () {
      coms.trigger('trips:unhighlight');
    },


    toggleSelect: function (e) {
      var selected = !this.model.get('selected');
      this.model.set('selected', selected);
      this.$el.toggleClass('selected', selected);
    },
  });

});
