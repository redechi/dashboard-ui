define([
  'backbone',
  '../../communicator',
  'hbs!tmpl/item/trip_tmpl'
],
function( Backbone, coms, TripTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
      coms.on('focus', _.bind(this.highlight, this))
    },

    triggerFocus: function () {
      coms.trigger('focus', this.model);
    },

    removeFocus: function () {
      coms.trigger('removeFocus', this.model);
    },

    selectModel: function (e) {
      if(!!e.target.checked) {
        this.model.set('selected', true);
      } else {
        this.model.set('selected', false);
      }
      this.triggerFocus();
    },

    highlight: function () {
      this.$el.find('.trip').addClass('highlighted');
    },

    tagName: "li",

    /* on render callback */
    onRender: function () {},

    template: TripTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
      'mouseenter': 'triggerFocus',
      'mouseleave': 'removeFocus',
      'change [type="checkbox"]': 'selectModel'
    }

  });

});
