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
        var name = filter.get('name')
        $('.btn-popover[data-filter="' + name + '"]')
          .popover({
            html: true,
            content: function() { return $('.popoverContent[data-filter="' + name + '"]').html(); },
            placement: 'bottom'
          })
          .popover('show');

        if(name == 'distance' || name == 'duration' || name == 'cost') {
          $('.popover .' + name + 'FilterValue').slider({
            min: 0,
            max: Math.ceil(filter.get('max')),
            formater: filter.get('formatter'),
            value: filter.get('value') || [0, filter.get('max')],
            tooltip_split: true
          });
        }
      }, 0);



      // TODO: trigger add filter analytics event
    }
  });

});
