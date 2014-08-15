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

      coms.trigger('filter:closePopovers');
    },


    template: TripTmpl,


    events: {
      'click .close': 'closeOverlay',
      'click .nextTrip': 'showNextTrip',
      'click .prevTrip': 'showPrevTrip'
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
      var selectedTrips = new Backbone.Collection(this.collection.where({selected: true}));
      if(!selectedTrips.length) {
        selectedTrips = this.collection;
      }
      var totalTripCount = selectedTrips.length,
          idx = selectedTrips.indexOf(this.model);

      this.nextTrip = selectedTrips.at(idx - 1);
      this.prevTrip = selectedTrips.at(idx + 1);

      $('.prevTrip', this.$el).toggleClass('noTrip', !this.prevTrip);
      $('.nextTrip', this.$el).toggleClass('noTrip', !this.nextTrip);
      $('.tripIndex', this.$el).text(totalTripCount - idx);
      $('.totalTripCount', this.$el).text(totalTripCount);
    },


    closeOverlay: function() {
      coms.trigger('trips:closeSingleTripOverlay');
    },


    showNextTrip: function() {
      this.model = this.nextTrip;
      this.showTrip();
    },


    showPrevTrip: function() {
      this.model = this.prevTrip;
      this.showTrip();
    },


    showTrip: function() {
      this.mapView.collection = new Backbone.Collection(this.model);
      this.mapView.updateMap();

      this.singleTripView.model = this.model;
      this.singleTripView.render();

      this.updateTripNavigation();
    },


    onRender: function() {
      this.mapView = new MapView({layout: 'single_trip'});

      this.singleTripView = new SingleTripView();
      this.showTrip();

      this.map.show(this.mapView);
      this.trip.show(this.singleTripView);
    },


    onShow: function() {
      this.mapView.fitBounds();
    }
  });
});
