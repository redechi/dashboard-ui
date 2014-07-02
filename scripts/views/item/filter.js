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

      coms.on('filter:change', _.bind(this.onChange, this));
      coms.on('filter:add', _.bind(this.onChange, this));
    },

    tagName: 'li',
    template: FiltersTmpl,

    deleteFilter: function () {
      this.model.destroy();
      this.destroy();
      // TODO: trigger remove filter analytics event
    },

    onRender: function() {
      var name = this.model.get('name'),
          value = this.model.get('value'),
          self = this;


      this.initializePopovers();

      setTimeout(_.bind(self.onChange, self), 0);

      // TODO: trigger add filter analytics event
    },

    onChange: function() {
      console.log('onChange')
      var name = this.model.get('name');

      if (name == 'vehicle') {
        console.log(this.model.get('value'))
        console.log(this.model.get('valueText'))
        console.log($('.btn-filter[data-filter="vehicle"] .btn-text').text())
        $('.appliedFilters .vehicleFilterValue').val(this.model.get('value'));
        $('.btn-filter[data-filter="vehicle"] .btn-text').text(this.model.get('valueText'));
      }
    },

    initializePopovers: function () {
      var name = this.model.get('name'),
          self = this;

      function popoverCallback() {
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
        if(name !== 'date' && self.model.get('showPopover') === true) {
          $('.btn-popover[data-filter="' + name + '"]').popover('show');
        }

      }, 0);

    }

  });

});
