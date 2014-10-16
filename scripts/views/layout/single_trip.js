define([
  'backbone',
  'communicator',
  'models/trip',
  '../item/single_trip',
  '../item/map',
  '../item/header',
  'hbs!tmpl/layout/single_trip_tmpl',
  '../layout/overlay',
  '../../controllers/analytics'
],
function( Backbone, coms, Trip, SingleTripView, MapView, HeaderView, TripTmpl, OverlayLayout, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: TripTmpl,


    initialize: function() {
      if(!this.model) {
        new OverlayLayout({type: 'invalidTrip'});
      }

      //if user clicks on a selected trips, only toggle through selected
      var selectedTrips = new Backbone.Collection(this.collection.where({selected: true}));
      if(selectedTrips.contains(this.model)) {
        this.collection = selectedTrips;
      }

      coms.once('overlay:hide', this.destroy, this);
    },


    events: {
      'click .close': 'destroy',
      'click .nextTrip': 'showNextTrip',
      'click .prevTrip': 'showPrevTrip'
    },


    regions: {
      map: '#map',
      trip: '#tripDetails'
    },


    updateTrip: function() {
      this.model.initialize();
      this.onShow();
    },


    updateTripNavigation: function() {
      var totalTripCount = this.collection.length,
          idx = this.collection.indexOf(this.model);

      this.nextTrip = this.collection.at(idx - 1);
      this.prevTrip = this.collection.at(idx + 1);

      $('.prevTrip', this.$el).toggleClass('disabled', !this.prevTrip);
      $('.nextTrip', this.$el).toggleClass('disabled', !this.nextTrip);
      $('.tripIndex', this.$el).text(totalTripCount - idx);
      $('.totalTripCount', this.$el).text(totalTripCount);
    },


    showNextTrip: function() {
      if(this.nextTrip) {
        this.model = this.nextTrip;
        this.showTrip();
      }
    },


    showPrevTrip: function() {
      if(this.prevTrip) {
        this.model = this.prevTrip;
        this.showTrip();
      }
    },


    showTrip: function() {
      this.mapView.collection = new Backbone.Collection(this.model);
      this.mapView.updateMap();

      this.singleTripView.model = this.model;
      this.singleTripView.render();

      this.updateTripNavigation();

      analytics.trackPageview('/trips/' + this.model.get('id'));
      analytics.trackEvent('single trip', 'Show');
    },


    onRender: function() {
      this.mapView = new MapView({layout: 'single_trip'});

      this.singleTripView = new SingleTripView();
      this.showTrip();

      this.map.show(this.mapView);
      this.trip.show(this.singleTripView);
    },


    onBeforeDestroy: function () {
      coms.trigger('overlay:destroy');
    },


    onShow: function() {
      var self = this;
      _.defer(function() { self.mapView.fitBounds(); });
    }
  });
});
