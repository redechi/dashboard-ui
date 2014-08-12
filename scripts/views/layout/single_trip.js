define([
  'backbone',
  'communicator',
  'models/trip',
  '../item/single_trip',
  '../item/map',
  '../item/header',
  'hbs!tmpl/layout/single_trip_tmpl',
  '../layout/overlay',
  '../../controllers/login',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, Trip, SingleTripView, MapView, HeaderView, TripTmpl, OverlayLayout, login, formatters ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log('initialize a Single Trip Composite View');

      if(!this.model) {
        regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'invalidTrip'}));
      }
    },


    collection: new Backbone.Collection([]),


    template: TripTmpl,


    events: {
      'click .close': 'closeOverlay',
      'click .nextTrip': 'showNextTrip',
      'click .prevTrip': 'showPrevTrip'
    },


    collectionEvents: {
      'reset': 'render'
    },


    regions: {
      map: '#map',
      trip: '#tripDetails'
    },


    updateTrip: function() {
      this.model.initialize();
      coms.trigger('overlay:hide');
      this.onShow();
    },


    updateTripNavigation: function() {
      var totalTripCount = this.collection.length,
          idx = this.collection.indexOf(this.model);

      this.nextTrip = this.collection.at(idx - 1);
      this.prevTrip = this.collection.at(idx + 1);

      this.model.set({
        totalTripCount: totalTripCount,
        index: totalTripCount - idx,
        prevTrip: (this.prevTrip) ? this.prevTrip.get('id') : null,
        nextTrip: (this.nextTrip) ? this.nextTrip.get('id') : null
      });
    },


    closeOverlay: function() {
      coms.trigger('trips:closeSingleTripOverlay');
    },


    showNextTrip: function() {
      this.model = this.nextTrip;
      this.render();
    },


    showPrevTrip: function() {
      this.model = this.prevTrip;
      this.render();
    },


    onBeforeRender: function() {
      this.updateTripNavigation();
    },


    onRender: function() {
      this.mapView = new MapView({collection: new Backbone.Collection(this.model), layout: 'single_trip'});
      this.map.show(this.mapView);

      this.mapView.highlightAll();

      var s = new SingleTripView({model: this.model});
      this.trip.show(s);
    },


    onShow: function() {
      this.mapView.fitBounds();
    }
  });
});
