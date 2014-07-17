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

    triggerHighlight: function () {
      coms.trigger('trips:highlight', this.model);
      this.$el.addClass('highlighted');
    },

    removeHighlight: function () {
      var selected = this.model.get('selected');
      coms.trigger('trips:unhighlight');
      if (selected) return;
      this.$el.removeClass('highlighted');
    },

    toggleSelect: function (e) {
      var selected = !this.model.get('selected');
      this.model.set('selected', selected);
      this.$el.toggleClass('selected', selected);
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

    ui: {},

    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'click': 'toggleSelect'
    },


    onRender: function () {}

  });

});
