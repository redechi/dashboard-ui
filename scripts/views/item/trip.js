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
      coms.trigger('trips:unhighlight', this.model);
    },


    toggleSelect: function (e) {
      var selected = !this.model.get('selected');
      this.model.set('selected', selected);
      this.$el.toggleClass('selected', selected);

      if(selected) {
        coms.trigger('trips:highlight', this.model);
        coms.trigger('trips:select', this.model);
      } else {
        coms.trigger('trips:unhighlight', this.model);
        coms.trigger('trips:deselect', this.model);
      }
    },


    onRender: function() {
      this.$el.attr({
        'data-start_time': this.model.get('start_time'),
        'data-distance_m': this.model.get('distance_m'),
        'data-average_mpg': this.model.get('average_mpg'),
        'data-fuel_cost_usd': this.model.get('fuel_cost_usd'),
        'data-duration': this.model.get('duration')
      });
    }
  });

});
