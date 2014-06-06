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

      //extend popover to allow callback
      var tmp = $.fn.popover.Constructor.prototype.show;
      $.fn.popover.Constructor.prototype.show = function () {
        tmp.call(this);
        if (this.options.callback) {
          this.options.callback();
        }
      };
    },

    tagName: 'li',

    template: FiltersTmpl,

    deleteFilter: function () {
      this.model.destroy();
      this.close();
      // TODO: trigger remove filter analytics event
    },

    onRender: function() {
      var name = this.model.get('name'),
          filter = this.model;

      function initializePopover() {
        if(name == 'date') {
          $('.dateFilterValue').val(filter.get('value'));
        } else if(name == 'location') {
          $('.locationFilterValueAddress').val(filter.get('valueText'));
          $('.locationFilterValueType').val(filter.get('type'));
        }
      }

      setTimeout(function() {
        $('.btn-popover[data-filter="' + name + '"]').popover({
          html: true,
          content: function() { return $('.popoverContent[data-filter="' + name + '"]').html(); },
          placement: 'bottom',
          callback: initializePopover
        });

        //don't show popover for date filter
        if(name !== 'date') {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);



      // TODO: trigger add filter analytics event
    }

  });

});
