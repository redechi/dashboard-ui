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
      'click .remove-filter': 'deleteFilter'
    },

    initialize: function() {
      console.log('initialize a Filters ItemView');
    },

    tagName: 'li',
    template: FiltersTmpl,

    deleteFilter: function () {
      this.model.destroy();
      this.destroy();
    },

    onRender: function() {
      this.initializePopover();
    },

    selectItem: function(item) {
      $(item)
        .addClass('selected')
        .siblings()
        .removeClass('selected');
    },

    initializePopover: function () {
      var self = this,
          filter = this.model,
          name = filter.get('name');

      function popoverCallback() {
        if(name === 'date') {
          self.selectItem('.dateFilterValue li[data-value="' + filter.get('valueSelected') + '"]');

          $('.dateFilterCustom').toggle(filter.get('valueSelected') === 'custom');
          $('.popover .dateFilterCustom input').datepicker({
            format: 'mm/dd/yy',
            startDate: new Date(2013, 2, 12),
            endDate: moment().add('days', 1).startOf('day').toDate()
          });
          if(filter.get('valueSelected') === 'custom') {
            var value = filter.get('getValue').call(filter, 'custom'),
                startDate = moment(filter.get('trimDate').call(filter, value[0])).toDate(),
                endDate = moment(filter.get('trimDate').call(filter, value[1])).toDate();
            $('.popover .dateFilterValueCustomStart').datepicker('setDate', startDate);
            $('.popover .dateFilterValueCustomEnd').datepicker('setDate', endDate);
          }
        } else if (name === 'vehicle') {
          self.selectItem('.vehicleFilterValue li[data-value="' + filter.get('value') + '"]');
        }
      }

      setTimeout(function() {
        $('.btn-popover[data-filter="' + name + '"]').popover('destroy');

        var popoverTemplate = $('.popoverTemplate[data-filter="' + name + '"]');
        $('.btn-popover[data-filter="' + name + '"]').popover({
          html: true,
          content: function() { return popoverTemplate.html(); },
          title:  function() { return popoverTemplate.attr('title'); },
          placement: 'bottom',
          callback: popoverCallback
        });

        //don't show popovers for initial filters
        if(filter.get('showPopover') === true) {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);

    }

  });

});
