define([
  'backbone',
  'communicator',
  '../../collections/filters',
  'hbs!tmpl/item/filters_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, filters, FiltersTmpl, formatters ) {
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

    initializePopover: function () {
      if(name == 'date') {
        $('.dateFilterValue').val(self.model.get('dateType'));
      } else if(name == 'location') {
        $('.locationFilterValueAddress').val(self.model.get('valueText'));
        $('.locationFilterValueType').val(self.model.get('type'));
      } else if (name == 'distance') {
        $('.distanceFilterNotes').toggle(self.model.get('max') !== 0);
        $('.distanceFilterNotes .min span').text(formatters.distance(self.model.get('min')));
        $('.distanceFilterNotes .max span').text(formatters.distance(self.model.get('max')));
      } else if (name == 'duration') {
        $('.durationFilterNotes').toggle(self.model.get('max') !== 0);
        $('.durationFilterNotes .min span').text(formatters.duration(self.model.get('min')));
        $('.durationFilterNotes .max span').text(formatters.duration(self.model.get('max')));
      } else if (name == 'cost') {
        $('.costFilterNotes').toggle(self.model.get('max') !== 0);
        $('.costFilterNotes .min').text(formatters.cost(self.model.get('min')));
        $('.costFilterNotes .max').text(formatters.cost(self.model.get('max')));
      }
    },

    onRender: function() {
      var name = this.model.get('name'),
          self = this;

      setTimeout(function() {
        $('.btn-popover[data-filter="' + name + '"]').popover({
          html: true,
          content: function() { return $('.popoverContent[data-filter="' + name + '"]').html(); },
          placement: 'bottom',
          callback: self.initializePopover
        });

        //don't show popover for date filter
        if(name !== 'date' && self.model.get('showPopover') === true) {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);



      // TODO: trigger add filter analytics event
    }

  });

});
