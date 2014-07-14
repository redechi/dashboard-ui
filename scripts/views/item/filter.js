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
      'show.bs.popover .btn-popover[data-filter="vehicle"]': 'vehiclePopover',
      'show.bs.popover .btn-popover[data-filter="date"]': 'datePopover',
      'shown.bs.popover .btn-popover[data-filter="date"]': 'initializeDatePicker'
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

    vehiclePopover: function() {
      this.selectItem('.vehicleFilterValue li[data-value="' + this.model.get('value') + '"]');
    },

    datePopover: function() {
      this.selectItem('.dateFilterValue li[data-value="' + this.model.get('valueSelected') + '"]');
      $('.dateFilterCustom').toggle(this.model.get('valueSelected') === 'custom');
    },

    initializeDatePicker: function() {
      var filter = this.model;

      $('.popover .dateFilterCustom input').datepicker({
        format: 'mm/dd/yy',
        startDate: new Date(2013, 2, 12),
        endDate: moment().add('days', 1).startOf('day').toDate()
      });
      if(filter.get('valueSelected') === 'custom') {
        var value = filter.get('getValue').call(filter, 'custom'),
            startDate = moment(filter.get('trimDate').call(filter, value[0])).toDate(),
            endDate = moment(filter.get('trimDate').call(filter, value[1])).toDate();
        $('.popover .dateFilterValueCustomStart')
          .datepicker('setDate', startDate)
          .removeClass('changed');
        $('.popover .dateFilterValueCustomEnd')
          .datepicker('setDate', endDate)
          .removeClass('changed');
      }
    },

    initializePopover: function () {
      var filter = this.model,
          name = filter.get('name');

      setTimeout(function() {
        $('.btn-popover[data-filter="' + name + '"]').popover('destroy');

        var popoverTemplate = $('.popoverTemplate[data-filter="' + name + '"]');
        $('.btn-popover[data-filter="' + name + '"]').popover({
          html: true,
          content: function() { return popoverTemplate.html(); },
          title:  function() { return popoverTemplate.attr('title'); },
          placement: 'bottom'
        });

        //don't show popovers for initial filters
        if(filter.get('showPopover') === true) {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);

    }

  });

});
