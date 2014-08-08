define([
  'backbone',
  'hbs!tmpl/item/single_trip_tmpl',
  '../../controllers/unit_formatters'
],
function( Backbone, SingleTripTmpl, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a SingleTripTmpl ItemView");
    },

    template: SingleTripTmpl,

    templateHelpers: {
      over60Minutes: function() {
        return (this.duration >= 60);
      },
      startAddress: function() {
        return formatters.formatAddress(this.start_location.name);
      },
      endAddress: function() {
        return formatters.formatAddress(this.end_location.name);
      }
    }
  });
});
