define([
  'backbone',
  'communicator',
  '../../collections/filters',
  '../../collections/vehicles',
  'hbs!tmpl/item/filters_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, filters, vehicles, FiltersTmpl, formatters ) {
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
      this.destroy();
    },

    onRender: function() {
      var name = this.model.get('name'),
          value = this.model.get('value'),
          self = this;

      this.initializePopovers();
    },

    initializePopovers: function () {
      var filter = this.model,
          name = filter.get('name');

      function popoverCallback() {
        if(name === 'date') {
          $('.dateFilterValue').val(filter.get('valueSelected'));
          $('.dateFilterCustom').toggle(filter.get('valueSelected') === 'custom');
          if(filter.get('valueSelected') === 'custom') {
            var value = filter.get('getValue').call(filter, 'custom'),
                startDate = moment(value[0]).format('MM/DD/YY'),
                endDate = moment(value[1]).format('MM/DD/YY');
            $('.dateFilterValueCustomStart').datepicker('setDate', startDate);
            $('.dateFilterValueCustomEnd').datepicker('setDate', endDate);
          }
        } else if (name === 'vehicle') {
          $('.vehicleFilterValue').val(filter.get('value'));
        }
      }

      setTimeout(function() {
        $('.btn-popover[data-filter="' + name + '"]').popover({
          html: true,
          content: function() { return $('.popoverContent[data-filter="' + name + '"]').html(); },
          title:  function() { return $('.popoverContent[data-filter="' + name + '"]').attr('title'); },
          placement: 'bottom',
          callback: popoverCallback
        });

        //don't show popover for date filter
        if(name !== 'date' && filter.get('showPopover') === true) {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);

    }

  });

});
