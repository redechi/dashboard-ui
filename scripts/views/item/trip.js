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
      coms.on('focus', _.bind(this.addHighlight, this))
    },

    triggerFocus: function () {
      coms.trigger('focus', this.model);
    },

    selectModel: function (e) {
      if(!!e.target.checked) {
        this.model.set('selected', true);
      } else {
        this.model.set('selected', false);
      }
      this.triggerFocus();
      this.addHighlight();
    },

    addHighlight: function (model) {
      model = model || this.model;
      var id = model.get('id');
      this.$el.find('[data-trip_id='+id+']').addClass('highlighted');
    },

    removeHighlight: function (e) {
      if(!!e.target.checked) return;
      var id = this.model.get('id');
      this.$el.find('[data-trip_id='+id+']').removeClass('highlighted');
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
      'mouseout': 'removeHighlight',
      'change [type="checkbox"]': 'selectModel'
    }

  });

});

