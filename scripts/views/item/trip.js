define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/trip_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, TripTmpl, formatters  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
    },

    triggerHighlight: function () {
      coms.trigger('trips:highlight', this.model);
      coms.trigger('trips:zoom', this.model);
      this.$el.addClass('highlighted');
    },

    removeHighlight: function () {
      var selected = this.model.get('selected');
      coms.trigger('trips:unhighlight');
      coms.trigger('trips:unzoom');
      if (selected) return;
      this.$el.removeClass('highlighted');
    },

    selectModel: function (e) {
      var selected = e.target.checked;
      this.model.set('selected', selected);
    },

    tagName: "li",
    /* on render callback */
    onRender: function () {},

    template: TripTmpl,

    templateHelpers: function() {
      var helpers = {
        distance: formatters.distance(this.model.get('distance_miles')),
        duration: formatters.durationMin(this.model.get('duration')),
        duration_over_70_min: Math.ceil(this.model.get('duration_over_70_s') / 60),
      };

      if(this.model.get('duration_over_70_s') === 0) {
        helpers.noSpeeding = true;
      }

      if(this.model.get('hard_brakes') === 0) {
        helpers.noHardBrakes = true;
      }

      if(this.model.get('hard_accels') === 0) {
        helpers.noHardAccels = true;
      }

      return helpers;
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
      'mouseenter': 'triggerHighlight',
      'mouseleave': 'removeHighlight',
      'change [type="checkbox"]': 'selectModel'
    }

  });

});
