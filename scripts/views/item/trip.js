define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/trip_tmpl'
],
function( Backbone, coms, TripTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
    },

    triggerHighlight: function () {
      coms.trigger('trips:highlight', this.model);
      coms.trigger('trips:zoom', this.model);
    },

    removeHighlight: function () {
      coms.trigger('trips:unhighlight');
      coms.trigger('trips:unzoom');
    },

    selectModel: function (e) {
      if(!!e.target.checked) {
        this.model.set('selected', true);
      } else {
        this.model.set('selected', false);
      }
    },

    tagName: "li",

    /* on render callback */
    onRender: function () {},

    template: TripTmpl,

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
