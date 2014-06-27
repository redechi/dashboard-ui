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
      return {
        noSpeeding: (this.model.get('duration_over_70_s') === 0),
        noHardBrakes: (this.model.get('hard_brakes') === 0),
        noHardAccels: (this.model.get('hard_accels') === 0)
      };
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
