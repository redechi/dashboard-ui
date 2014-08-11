define([
  'backbone',
  'communicator',
  '../../collections/filters',
  '../../collections/vehicles',
  'hbs!tmpl/item/filter_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, filters, vehicles, FiltersTmpl, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    events: {
      'click .remove-filter': 'deleteFilter'
    },

    initialize: function() {
      console.log('initialize a Filters ItemView');
    },

    tagName: 'li',

    template: FiltersTmpl,


    deleteFilter: function () {
      $('.btn-popover', this.$el).popover('destroy');
      this.model.destroy();
      this.destroy();
    },


    selectItem: function(item) {
      $(item)
        .addClass('selected')
        .siblings()
        .removeClass('selected');
    },


    buildPopover: function () {
      var name = this.model.get('name');

      $('.btn-popover', this.$el)
        .popover('destroy')
        .popover({
          html: true,
          content: function() { return $('.popoverTemplate[data-filter="' + name + '"]').html(); },
          title: function() { return $('.popoverTemplate[data-filter="' + name + '"]').attr('title'); },
          placement: 'bottom'
        });

      if(this.model.get('showPopover') === true) {
        $('.btn-popover', this.$el).popover('show');
      }
    },


    onShow: function() {
      this.buildPopover();
    }

  });
});
