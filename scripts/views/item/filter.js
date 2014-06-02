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
      'click .remove-filter': 'deleteFilter',
      'change input': 'handleUpdate',
      'change select': 'handleUpdate'
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
      var filter = this.model;

      setTimeout(function() {
        var name = filter.get('name');
        $('.btn-popover[data-filter="' + name + '"]')
          .popover({
            html: true,
            content: function() { return $('.popoverContent[data-filter="' + name + '"]').html(); },
            placement: 'bottom'
          })
          .popover('show');

      }, 0);



      // TODO: trigger add filter analytics event
    }
  });

});
