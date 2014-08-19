define([
  'backbone',
  'hbs!tmpl/item/single_trip_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, SingleTripTmpl, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: SingleTripTmpl,

    templateHelpers: {
      over60Minutes: function() {
        return (this.duration >= 60);
      },
      startAddress: function() {
        if(this.start_location) {
          return formatters.formatAddress(this.start_location.name);
        }
      },
      endAddress: function() {
        if(this.end_location) {
          return formatters.formatAddress(this.end_location.name);
        }
      }
    }
  });
});
