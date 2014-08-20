define([
  'backbone',
  'hbs!tmpl/item/single_trip_tmpl'
],
function( Backbone, SingleTripTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({
    template: SingleTripTmpl
  });
});
