define([
  'backbone',
  'communicator',
  '../../collections/trips',
  'hbs!tmpl/item/filters_tmpl'
],
function( Backbone, coms, trips, FiltersTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
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
      this.model.destroy();
      this.close();
      // TODO: trigger remove filter analytics event
    },

    onRender: function() {
      var title = this.model.get('title');
      $('.btn-text', this.el).text(title);

      $('.btn-popover', this.el).popover({
        html: true,
        content: function() { return $('.distance.popoverContent').html(); },
        placement: 'bottom'
      }).popover('show');

      // TODO: trigger add filter analytics event
    }
  });

});
